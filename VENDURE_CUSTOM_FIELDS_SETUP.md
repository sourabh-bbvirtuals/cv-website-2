# Vendure Custom Fields Setup for Faculty Collections

## Issue Identified
The custom fields `title`, `tag`, `subjects`, and `activeSubjects` are not configured in your Vendure `CollectionCustomFields` schema.

## Required Custom Fields

You need to add these custom fields to your Vendure Collection entity:

### 1. Title Field
- **Name**: `title`
- **Type**: `String`
- **Description**: Faculty title (e.g., "GST Guru of India")
- **Required**: No
- **Default Value**: "Expert Faculty"

### 2. Tag Field
- **Name**: `tag`
- **Type**: `String`
- **Description**: Faculty tag/badge (e.g., "Expert", "GST Guru")
- **Required**: No
- **Default Value**: "Faculty"

### 3. Subjects Field
- **Name**: `subjects`
- **Type**: `String` (Array)
- **Description**: List of subjects the faculty teaches
- **Required**: No
- **Default Value**: []

### 4. Active Subjects Field
- **Name**: `activeSubjects`
- **Type**: `String` (Array)
- **Description**: Currently active subjects
- **Required**: No
- **Default Value**: []

## How to Add Custom Fields in Vendure

### Option 1: Via Vendure Admin UI
1. Go to your Vendure Admin panel
2. Navigate to **Settings** → **Custom Fields**
3. Select **Collection** entity
4. Add the above custom fields one by one

### Option 2: Via Code (Recommended)
Add this to your Vendure server configuration:

```typescript
// In your Vendure server config
export const config: VendureConfig = {
  // ... other config
  customFields: {
    Collection: [
      {
        name: 'title',
        type: 'string',
        label: 'Faculty Title',
        description: 'Professional title of the faculty member',
        nullable: true,
      },
      {
        name: 'tag',
        type: 'string',
        label: 'Faculty Tag',
        description: 'Tag or badge for the faculty member',
        nullable: true,
      },
      {
        name: 'subjects',
        type: 'string',
        list: true,
        label: 'Subjects',
        description: 'List of subjects taught by this faculty',
        nullable: true,
      },
      {
        name: 'activeSubjects',
        type: 'string',
        list: true,
        label: 'Active Subjects',
        description: 'Currently active subjects',
        nullable: true,
      },
    ],
  },
  // ... rest of config
};
```

## Testing Steps

1. **Add the custom fields** to your Vendure server
2. **Restart your Vendure server**
3. **Visit** `/debug-collections` to see the custom fields
4. **Edit a faculty collection** in Vendure Admin to add values
5. **Test the faculty page** with the correct slug

## Current Status

- ✅ Faculty page structure is ready
- ✅ GraphQL queries are set up
- ✅ UI components are implemented
- ❌ Custom fields need to be configured in Vendure
- ❌ Faculty collection data needs to be populated

## Next Steps

1. Configure the custom fields in your Vendure server
2. Find the correct faculty collection slug
3. Add data to the custom fields
4. Test the faculty page

## Debug URLs

- **Collections List**: `/debug-collections`
- **Faculty Page**: `/faculty/{correct-slug}`

---

## Blogs collection setup

For the **Blogs** page (`/blogs`) to show posts, use one of these structures in Vendure.

### Option A: Parent collection + child collections (recommended)

1. Create a **parent collection**:
   - **Name**: e.g. `Blogs`
   - **Slug**: must be exactly **`blogs`** (lowercase). The storefront looks for a collection whose slug is `blogs` (case-insensitive).
2. For each blog post, create a **child collection** under that parent:
   - **Name**: post title (e.g. "CA Final Law SPOM Strategy")
   - **Slug**: URL-friendly slug (e.g. `ca-final-law-spom-strategy`)
   - **Featured asset**: main image (optional)
   - **Custom fields → Custom data**: JSON, e.g.:
     ```json
     {
       "title": "Detailed Strategy – From starting SPOM to acing it",
       "excerpt": "Short summary for the listing page...",
       "author": { "name": "Shubham Agrawal", "role": "CA" },
       "category": "Law",
       "tags": ["AUDITING AND ASSURANCE"],
       "publishedAt": "2024-11-25",
       "readTime": "5 min read",
       "featured": false
     }
     ```
   - For full post body, add `htmlContent` or `blocks` in the same customData; the detail page uses it.

### Option B: Single “blogs” collection with JSON array (your setup)

1. Create **one** collection with **slug** `blogs`.
2. Do **not** add child collections.
3. In **Custom data**, you can use either:
   - A **top-level JSON array** (valid JSON starting with `[`):
     ```json
     [
       { "id": "blog-1", "slug": "my-post", "title": "...", "excerpt": "...", "content": "<p>...</p>", "author": "Name", "date": "2026-01-01", "tags": [] }
     ]
     ```
   - Or an object with **`posts`** / **`blogs`**:
   ```json
   {
     "posts": [
       {
         "id": "blog-1",
         "slug": "my-first-post",
         "title": "First post",
         "excerpt": "Summary...",
         "image": "https://...",
         "author": { "name": "Author" },
         "publishedAt": "2024-11-25",
         "tags": ["Tag1"]
       }
     ]
   }
   ```

### Visibility (important)

If the collection is set to **Private** in Vendure, it may **not appear** in the Shop API `collections` list. The storefront now also loads the **`blogs`** collection **by slug** so your JSON array can still work. If you still see no posts, set the collection to **visible on your sales channel** (or non-private) in Vendure Admin and ensure it is **assigned to the same channel** as your storefront (`vendure-token` / channel in your API URL).

### Checklist

- Collection slug is **`blogs`** (or `Blogs`; matching is case-insensitive).
- Either: parent has **child collections** with customData, or parent’s customData has **`posts`** / **`blogs`** array.
- Collection entity has a **customData** (or equivalent) custom field so the JSON is stored.
- After changing data in Vendure, reload `/blogs` (and restart Remix if needed).
