import {
  MetaFunction,
  useLoaderData,
  useNavigate,
  useFetcher,
} from '@remix-run/react';
import { useState, useEffect } from 'react';
import {
  DataFunctionArgs,
  ActionFunctionArgs,
  json,
} from '@remix-run/server-runtime';
import { APP_META_TITLE } from '~/constants';

import {
  ProductHeader,
  ProductForm,
  ProductTabs,
  ProductSummary,
} from '~/components/course2/product';
import { ProductComboTabs } from '~/components/course2/product/ProductComboTabs';

import { getProductBySlug } from '~/providers/course2';
import { addProductToCart } from '~/providers/cart/vendureCart';
import { getActiveCustomer } from '~/providers/customer/customer';
import Layout from '~/components/Layout';
import {
  getNextOrderStates,
  transitionOrderToState,
} from '~/providers/orders/order';
import { pushToDataLayer } from '~/utils/analytics';
import sanitizeHtml from 'sanitize-html';
import { getCollectionContentBySlug } from '~/providers/blog/blog-content';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.product?.title
        ? `${data.product.title} - ${APP_META_TITLE}`
        : `Course Product - ${APP_META_TITLE}`,
    },
    {
      name: 'description',
      content: `Learn ${
        data?.product?.title || ''
      } with expert faculty at Vsmart Academy`,
    },
  ];
};

export async function loader({ params, request }: DataFunctionArgs) {
  const { productSlug } = params;

  if (!productSlug) {
    throw new Response('Product slug is required', { status: 400 });
  }

  try {
    console.log('=== Loading Product from Vendure ===');
    console.log('Product Slug:', productSlug);
    console.log('==============================');

    const product = await getProductBySlug(productSlug, {
      request,
    });

    if (!product) {
      console.log('Product not found in Vendure:', productSlug);
      throw new Response('Product Not Found', { status: 404 });
    }

    const safeProduct = {
      ...product,
      description: product.description
        ? sanitizeHtml(product.description, {
            allowedTags: [
              'p',
              'br',
              'b',
              'strong',
              'i',
              'em',
              'u',
              'ul',
              'ol',
              'li',
              'table',
              'thead',
              'tbody',
              'tr',
              'th',
              'td',
              'div',
              'span',
            ],
            allowedAttributes: {
              '*': ['style'],
            },
            allowedStyles: {
              '*': {
                // allow basic color/font-weight/text-align only
                color: [
                  /^#(0x)?[0-9a-f]+$/i,
                  /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/,
                ],
                'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
                'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
              },
            },
          })
        : '',
      faculties: Array.isArray(product.faculties)
        ? product.faculties.map((f) => ({
            ...f,
            description: f.description
              ? sanitizeHtml(f.description, {
                  allowedTags: [
                    'p',
                    'br',
                    'b',
                    'strong',
                    'i',
                    'em',
                    'u',
                    'ul',
                    'ol',
                    'li',
                    'div',
                    'span',
                  ],
                  allowedAttributes: { '*': ['style'] },
                })
              : '',
          }))
        : product.faculties,
    };

    const [notes, reviews] = await Promise.all([
      getCollectionContentBySlug('notes', { request }),
      getCollectionContentBySlug('reviews', { request }),
    ]);

    return { product: safeProduct, notes, reviews };
  } catch (error) {
    console.error('Error loading product:', error);
    throw new Response('Product Not Found2', {
      status: 404,
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  console.log('=== Product Action ===');
  console.log('Request URL:', request.url);
  console.log('Params:', params);

  const formData = await request.formData();
  const actionType = formData.get('action') as string;
  const { productSlug } = params;

  console.log('Action type:', actionType);
  console.log('Product slug:', productSlug);

  if (!productSlug) {
    console.error('No product slug provided');
    return json(
      { success: false, error: 'Product slug is required' },
      { status: 400 },
    );
  }

  try {
    switch (actionType) {
      case 'mobileEntered': {
        const mobile = formData.get('mobile') as string;
        const attempt = formData.get('attempt') as string;
        const sellerSku = formData.get('sellerSku') as string;

        console.log('MobileEntered action called:', {
          mobile,
          attempt,
          sellerSku,
        });

        // Only update Google Sheets when BOTH mobile and attempt are present
        if (!mobile || mobile.length !== 10 || !attempt) {
          console.log(
            'Missing mobile or attempt, skipping Google Sheets update',
          );
          return json({
            success: true,
            message: 'Mobile and attempt data received',
            action: 'mobileEntered',
            googleSheetsUpdated: false,
            missingFields: {
              mobile: !mobile || mobile.length !== 10,
              attempt: !attempt,
            },
          });
        }

        // Validate mobile format
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
          console.log('Invalid mobile format, skipping Google Sheets update');
          return json({
            success: true,
            message: 'Invalid mobile format',
            action: 'mobileEntered',
            googleSheetsUpdated: false,
          });
        }

        // Check if user is logged in
        try {
          console.log('Checking authentication status...');
          const customerData = await getActiveCustomer({ request });
          const isLoggedIn = !!customerData?.activeCustomer;

          console.log('Authentication check result:', {
            hasCustomerData: !!customerData,
            hasActiveCustomer: !!customerData?.activeCustomer,
            isLoggedIn,
            customerId: customerData?.activeCustomer?.id,
          });

          // User is logged in, just return success
          console.log(
            'User is logged in (ID:',
            customerData?.activeCustomer?.id,
            '), skipping Google Sheets update',
          );
          return json({
            success: true,
            message: 'Mobile and attempt received',
            action: 'mobileEntered',
            isLoggedIn: true,
          });
        } catch (error) {
          console.error(
            'Error checking authentication or updating Google Sheets:',
            error,
          );
          console.error(
            'Error details:',
            error instanceof Error ? error.message : String(error),
          );
          // Return success even if there's an error to not block user flow
          return json({
            success: true,
            message: 'Mobile and attempt received',
            action: 'mobileEntered',
            error: 'Could not verify authentication status',
          });
        }
      }

      case 'addToCart': {
        const productVariantId = formData.get('productVariantId') as string;
        const quantity = parseInt(formData.get('quantity') as string) || 1;
        const productId = formData.get('productId') as string;
        const productName = formData.get('productName') as string;
        const productOffers = formData.get('productOffers') as string;
        const attempt = formData.get('attempt') as string;
        const variantName = formData.get('variantName') as string;
        const variantPrice = formData.get('variantPrice') as string;
        const variantSku = formData.get('variantSku') as string;
        const mobile = formData.get('mobile') as string;
        const faculty = formData.get('faculty') as string;
        const sellerSku = formData.get('sellerSku') as string;
        const relatedProductIds = formData.get('relatedProductIds') as string;

        console.log('=== addToCart Action Called ===');
        console.log('Product variant ID:', productVariantId);
        console.log('Quantity:', quantity);
        console.log('Product Name:', productName);
        console.log('Variant Name:', variantName);
        console.log('Variant Price:', variantPrice);
        console.log('Variant SKU:', variantSku);
        console.log('Mobile:', mobile);
        console.log('Attempt:', attempt);
        console.log('Faculty:', faculty);
        console.log('Related Product IDs:', relatedProductIds);

        if (!productVariantId) {
          console.error('No product variant ID provided');
          return json(
            { success: false, error: 'Product variant ID is required' },
            { status: 400 },
          );
        }

        console.log('Adding product to cart...');

        // Parse faculty safely
        let parsedFaculty = [];
        if (faculty) {
          try {
            parsedFaculty = JSON.parse(faculty);
          } catch (e) {
            parsedFaculty = [];
          }
        }
        const nextOrderStates = await getNextOrderStates({ request });
        console.log('Next order states:', nextOrderStates);
        if (nextOrderStates.includes('AddingItems')) {
          console.log('Transitioning order to AddingItems state...');
          const transitionResult = await transitionOrderToState('AddingItems', {
            request,
          });
          console.log('Order state transition result:', transitionResult);
        }

        const result = await addProductToCart(
          productVariantId,
          quantity,
          { request },
          {
            slug: productSlug,
            id: productId,
            name: productName,
            attempt,
            faculty: parsedFaculty,
            variantName,
            mobile,
            offers: JSON.parse(productOffers || '[]') as Array<{
              offerId: string;
              discountType: string;
              discountValue: number;
              discountAmount: number;
            }>,
            sellerSku,
            relatedProductIds: JSON.parse(
              relatedProductIds || '[]',
            ) as string[],
          },
        );
        // console.log('Add to cart result:', result);

        if (result) {
          console.log('Successfully added to cart, redirecting...');
          return json({
            success: true,
            message: 'Item added to cart successfully',
            cartData: result,
            variantSku: variantSku,
            variantPrice,
          });
        } else {
          console.error('Failed to add to cart - no result returned');
          return json(
            { success: false, error: 'Failed to add item to cart' },
            { status: 500 },
          );
        }
      }

      default:
        console.error('Invalid action type:', actionType);
        return json(
          { success: false, error: 'Invalid action' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Product action error:', error);
    return json(
      {
        success: false,
        error: 'An error occurred while processing your request',
      },
      { status: 500 },
    );
  }
}

export default function Course2ProductPage() {
  const { product, notes, reviews } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const addToCartFetcher = useFetcher<typeof action>();
  const googleSheetsFetcher = useFetcher<typeof action>();
  const [activeTab, setActiveTab] = useState('description');
  const [formData, setFormData] = useState<Record<string, string>>({
    mobile: '',
    attempt: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [viewItemEventSent, setViewItemEventSent] = useState(false);

  // Update form data when product loads
  useEffect(() => {
    if (product) {
      const newFormData = { ...formData };
      // Pre-populate attempt if available
      if (product.facetProperties?.['attempt']?.value && !newFormData.attempt) {
        // Don't auto-set, let user select it
      }
      // Auto-select first option for each optionProperty
      if (product.optionProperties && product.optionProperties.length > 0) {
        product.optionProperties.forEach((optionProperty) => {
          const fieldKey = `option_${optionProperty.id}`;
          if (
            !newFormData[fieldKey] &&
            optionProperty.options &&
            optionProperty.options.length > 0
          ) {
            newFormData[fieldKey] = optionProperty.options[0].id;
          }
        });
      }
      setFormData(newFormData);
    }
  }, [product?.id]); // Only depend on product ID to avoid infinite loops

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Calculate the values after this update
      const updatedMobile = field === 'mobile' ? value : updated.mobile;
      const updatedAttempt = field === 'attempt' ? value : updated.attempt;

      // Only update Google Sheets when BOTH mobile and attempt are present and valid
      const mobileValid = updatedMobile && updatedMobile.length === 10;
      const attemptValid = updatedAttempt && updatedAttempt.trim() !== '';

      if (mobileValid && attemptValid) {
        const mobileRegex = /^[6-9]\d{9}$/;
        if (mobileRegex.test(updatedMobile)) {
          // Both fields are valid, trigger Google Sheets update
          setTimeout(() => {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('action', 'mobileEntered');
            formDataToSubmit.append('mobile', updatedMobile);
            formDataToSubmit.append('attempt', updatedAttempt);
            formDataToSubmit.append('sellerSku', product.sellerSku);
            formDataToSubmit.append(
              'relatedProductIds',
              JSON.stringify(product.relatedProductIds),
            );
            googleSheetsFetcher.submit(formDataToSubmit, { method: 'POST' });
          }, 0);
        }
      }

      return updated;
    });

    // Clear validation error when user starts typing/selecting
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Form validation functions
  const validateMobileNumber = (mobile: string): string => {
    if (!mobile || mobile.trim() === '') {
      return 'Mobile number is required';
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.trim())) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  };

  const validateProductOptions = (): string => {
    // For combo products, check if variant is selected
    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      if (!formData.selectedVariant || formData.selectedVariant.trim() === '') {
        return 'Variant selection is required';
      }
      return '';
    }

    // For non-combo products, check if all option properties have selections
    for (const optionProperty of product.optionProperties) {
      const selectedOption = formData[`option_${optionProperty.id}`];
      if (!selectedOption || selectedOption.trim() === '') {
        return `${optionProperty.name} selection is required`;
      }
    }

    // Check for hardcoded book selection if not in optionProperties
    if (!product.optionProperties.some((op) => (op as any).isBooks)) {
      if (!formData.book || formData.book.trim() === '') {
        return 'Books selection is required';
      }
    }

    return '';
  };

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate mobile number
    const mobileError = validateMobileNumber(formData.mobile);
    if (mobileError) {
      errors.mobile = mobileError;
    }

    // Validate product options
    const optionsError = validateProductOptions();
    if (optionsError) {
      if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
        // For combo products, set error for variant selection
        if (
          !formData.selectedVariant ||
          formData.selectedVariant.trim() === ''
        ) {
          errors.selectedVariant = 'Variant selection is required';
        }
      } else {
        // For non-combo products, find which option property is missing
        for (const optionProperty of product.optionProperties) {
          const selectedOption = formData[`option_${optionProperty.id}`];
          if (!selectedOption || selectedOption.trim() === '') {
            errors[
              `option_${optionProperty.id}`
            ] = `${optionProperty.name} selection is required`;
          }
        }
      }
    }

    // Validate hardcoded book selection if not already in optionProperties
    if (!product.optionProperties.some((op) => (op as any).isBooks)) {
      if (!formData.book || formData.book.trim() === '') {
        errors.book = 'Books selection is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateProductTotal = () => {
    let total = 0;

    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      // For combo products, use direct variant selection
      if (formData.selectedVariant && product?.variantProperties) {
        const selectedVariant = product.variantProperties.find(
          (v) => v.id === formData.selectedVariant,
        );
        if (selectedVariant && selectedVariant.priceWithTax) {
          total += Math.round(selectedVariant.priceWithTax / 100);
        }
      }
    } else {
      // For non-combo products, find selected variant based on option combinations
      if (product?.variantProperties && product?.optionProperties) {
        const selectedOptionIds = product.optionProperties
          .map((optionProperty) => formData[`option_${optionProperty.id}`])
          .filter(Boolean);

        if (selectedOptionIds.length > 0) {
          const selectedVariant = product.variantProperties.find((variant) => {
            const variantOptionIds = variant.options.map((option) => option.id);
            return selectedOptionIds.every((selectedId) =>
              variantOptionIds.includes(selectedId),
            );
          });

          if (selectedVariant && selectedVariant.priceWithTax) {
            total += Math.round(selectedVariant.priceWithTax / 100);
          }
        }
      }
    }

    // Add additional costs from form data (if they exist)
    const additionalCostFields = ['offer', 'shipping', 'testSeries'];
    additionalCostFields.forEach((costField) => {
      if (formData[costField]) {
        const cost = parseInt(formData[costField], 10);
        if (!isNaN(cost)) {
          total += cost;
        }
      }
    });

    // Handle hardcoded book price if present
    if (formData.book === 'Hard Copy') {
      // You can add a price here if needed, e.g., total += 500;
    } else if (formData.book === 'Soft Copy') {
      // total += 0;
    }

    return Math.max(0, total);
  };

  useEffect(() => {
    setTotalPrice(calculateProductTotal());
  }, [formData, product]);

  // Track view_item event when form is ready (mobile, attempt, and all options selected)
  useEffect(() => {
    if (!product || viewItemEventSent) return;

    // Validate mobile number
    const mobileValid = formData.mobile && formData.mobile.length === 10;
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileValid || !mobileRegex.test(formData.mobile)) {
      return;
    }

    // Validate attempt is selected
    if (!formData.attempt || formData.attempt.trim() === '') {
      return;
    }

    // Get selected variant
    let selectedVariant: any = null;

    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      // For combo products, check if variant is selected
      const variantId = formData.selectedVariant;
      if (!variantId) {
        // If only one variant, auto-select it
        if (product.variantProperties?.length === 1) {
          selectedVariant = product.variantProperties[0];
        } else {
          return;
        }
      } else {
        selectedVariant = product.variantProperties?.find(
          (v) => v.id === variantId,
        );
        if (!selectedVariant) return;
      }
    } else {
      // For non-combo products, check if all options are selected
      const allOptionsSelected = product.optionProperties?.every(
        (optionProperty) => {
          const fieldKey = `option_${optionProperty.id}`;
          return formData[fieldKey] && formData[fieldKey].trim() !== '';
        },
      );

      if (!allOptionsSelected) {
        return;
      }

      // Find the selected variant based on option combinations
      const selectedOptionIds = product.optionProperties
        .map((optionProperty) => formData[`option_${optionProperty.id}`])
        .filter(Boolean);

      selectedVariant = product.variantProperties?.find((variant) => {
        const variantOptionIds = variant.options.map((option) => option.id);
        return selectedOptionIds.every((selectedId) =>
          variantOptionIds.includes(selectedId),
        );
      });

      if (!selectedVariant) return;
    }

    // All conditions met, send view_item event
    if (selectedVariant) {
      const price = selectedVariant.priceWithTax / 100; // Convert from cents to currency units
      pushToDataLayer({
        event: 'view_item',
        ecommerce: {
          currency: product.currencyCode || 'INR',
          value: price,
          items: [
            {
              item_id: selectedVariant.sku || selectedVariant.id,
              item_name: product.sellerSku || product.title,
              price: price,
              currency: product.currencyCode || 'INR',
              item_brand:
                product.facetProperties?.brand?.value || 'Vsmart Academy',
              item_category:
                product.facetProperties?.category?.value || 'Course',
              quantity: 1,
            },
          ],
        },
      });

      setViewItemEventSent(true);
    }
  }, [formData, product, viewItemEventSent]);

  // Handle Google Sheets fetcher response (mobileEntered action)
  useEffect(() => {
    if (googleSheetsFetcher.data) {
      const data = googleSheetsFetcher.data as any;
      if (data.action === 'mobileEntered') {
        // Google Sheets update handled - no UI action needed
        // Can add logging or success notification here if needed
        if (data.googleSheetsUpdated) {
          console.log('Google Sheets updated successfully');
        }
      }
    }
  }, [googleSheetsFetcher.data]);

  // Handle add to cart fetcher response
  useEffect(() => {
    if (addToCartFetcher.data) {
      const data = addToCartFetcher.data as any;

      // Only handle addToCart responses
      if (data.action === 'mobileEntered') {
        return; // This shouldn't happen, but just in case
      }

      // Handle addToCart responses
      if (data.success) {
        if (data?.cartData && data?.variantPrice) {
          const price = parseInt(data?.variantPrice);
          pushToDataLayer({
            event: 'add_to_cart',
            ecommerce: {
              currency: 'INR',
              value: price,
              items: [
                {
                  item_id: data?.variantSku || product.sellerSku,
                  item_name: product.sellerSku || product.title,
                  price: price / 100,
                  quantity: 1,
                },
              ],
            },
          });
        }
        setAddToCartSuccess(true);
        setTimeout(() => {
          navigate('/cart');
        }, 1000);
      } else {
        // Handle error - check if error property exists
        const errorMessage =
          'error' in data ? data.error : 'Failed to add item to cart';
        alert(`Failed to add item to cart: ${errorMessage}. Please try again.`);
      }
    }
  }, [addToCartFetcher.data, navigate, product]);

  const handleAddProductToCart = (overrideVariantId?: string) => {
    // Validate product is loaded
    if (!product) {
      console.error('Product not loaded');
      alert('Product not loaded. Please refresh the page and try again.');
      return;
    }

    // If adding via card, validate mobile and attempt; otherwise full form validation
    if (overrideVariantId) {
      const mobileError = validateMobileNumber(formData.mobile);
      if (mobileError) {
        setValidationErrors({ mobile: mobileError });
        return;
      }
      if (!formData.attempt) {
        setValidationErrors({ attempt: 'Attempt selection is required' });
        return;
      }
    } else {
      if (!validateProductForm()) {
        console.log('Form validation failed:', validationErrors);
        return;
      }
    }

    // Prevent multiple submissions only if we're already submitting addToCart
    // Allow addToCart even if mobileEntered is in progress
    // The fetcher can handle multiple requests sequentially

    setAddToCartSuccess(false);

    // console.log('=== Adding Product to Cart ===');
    // console.log('Product:', product);
    // console.log('Form Data:', formData);
    // console.log('Total Price:', totalPrice);

    // Validate required product fields
    if (!product.id || !product.title) {
      alert('Product information is incomplete');
      return;
    }

    let productVariantId: string;

    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      // For combo products, use direct variant selection
      // Priority: overrideVariantId (from button) > formData.selectedVariant > first variant if only one
      if (overrideVariantId) {
        productVariantId = overrideVariantId;
      } else if (formData.selectedVariant) {
        productVariantId = formData.selectedVariant;
      } else if (product.variantProperties?.length === 1) {
        // Auto-select single variant for combo products
        productVariantId = product.variantProperties[0].id;
      } else {
        alert('Please select a variant');
        return;
      }

      // Verify the selected variant exists (productVariantId is assigned above)
      const selectedVariant = product.variantProperties.find(
        (v) => v.id === productVariantId!,
      );
      if (!selectedVariant) {
        alert('Selected variant not found');
        return;
      }
    } else {
      // For non-combo products, find selected variant based on option combinations
      const selectedOptionIds = product.optionProperties
        .map((optionProperty) => formData[`option_${optionProperty.id}`])
        .filter(Boolean);

      if (selectedOptionIds.length === 0) {
        alert('Please select all required options');
        return;
      }

      const selectedVariant = product.variantProperties.find((variant) => {
        const variantOptionIds = variant.options.map((option) => option.id);
        return selectedOptionIds.every((selectedId) =>
          variantOptionIds.includes(selectedId),
        );
      });

      if (!selectedVariant) {
        alert('Selected variant not found');
        return;
      }

      productVariantId = selectedVariant.id;
    }

    console.log('Using selected variant ID:', productVariantId);

    // Prepare form data for submission
    const cartFormData = new FormData();
    cartFormData.append('action', 'addToCart');
    cartFormData.append('productVariantId', productVariantId);
    cartFormData.append('quantity', '1');
    cartFormData.append('productId', product.id);
    cartFormData.append('productName', product.title);
    cartFormData.append('productOffers', JSON.stringify(product.offers || []));
    cartFormData.append('attempt', formData.attempt || '');
    // Get the selected variant for variant name
    const selectedVariant = product.variantProperties.find(
      (v) => v.id === productVariantId,
    );
    cartFormData.append(
      'variantName',
      selectedVariant?.name || 'Selected Variant',
    );
    cartFormData.append('variantSku', selectedVariant?.sku || '');
    cartFormData.append('mobile', formData.mobile);
    cartFormData.append(
      'variantPrice',
      selectedVariant?.priceWithTax?.toString() || '0',
    );
    cartFormData.append('faculty', JSON.stringify(product.faculties || []));
    cartFormData.append('sellerSku', product.sellerSku || '');
    cartFormData.append(
      'relatedProductIds',
      JSON.stringify(product.relatedProductIds || []),
    );

    // Submit to server using addToCart fetcher
    addToCartFetcher.submit(cartFormData, { method: 'POST' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Layout>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumbs at the very top */}
          <ProductHeader product={product} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Product Image */}
            <div className="w-full">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md group">
                {product.productImages && product.productImages.length > 0 ? (
                  <img
                    src={product.productImages[0]}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    No Image Available
                  </div>
                )}
                {/* Optional "LIVE" or "BATCH" badge could go here */}
                {product.facetProperties?.batchType?.value && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm z-10">
                    {product.facetProperties.batchType.value.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Information and Selections */}
            <div className="flex flex-col gap-6">
              <ProductForm
                product={product}
                formData={formData}
                totalPrice={totalPrice}
                onFormChange={handleFormChange}
                validationErrors={validationErrors}
                onAddToCart={handleAddProductToCart}
                isAddingToCart={addToCartFetcher.state === 'submitting'}
              />
            </div>
          </div>

          {/* Bottom Section: Tabs */}
          <div className="mt-16 sm:mt-24 border-t border-slate-100 pt-12">
            {product &&
            product.facetProperties?.['type']?.value.toLowerCase() ===
              'combo' ? (
              <ProductComboTabs product={product} />
            ) : (
              <ProductTabs
                product={product}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                notes={notes}
                reviews={reviews}
              />
            )}
          </div>

          {product &&
            product.facetProperties?.['type']?.value.toLowerCase() ===
              'combo' && (
              <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Reviews
                  </h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <article
                          key={review.id}
                          className="border-b border-slate-100 pb-3 last:border-0"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {review.title || 'Review'}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {review.content || review.excerpt || 'No content'}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No reviews yet.</p>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Sample Notes
                  </h3>
                  {notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <article
                          key={note.id}
                          className="border-b border-slate-100 pb-3 last:border-0"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {note.title || 'Sample Note'}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {note.content || note.excerpt || 'No content'}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Sample notes will be available soon.
                    </p>
                  )}
                </section>
              </div>
            )}
        </main>
      </Layout>
    </div>
  );
}
