import { RelatedItemCard, type RelatedItemCardData } from './RelatedItemCard';

export interface RelatedItemsRowProps {
  items: RelatedItemCardData[];
  onAdd: (item: RelatedItemCardData) => void;
  addedItems: Record<string, boolean>;
}

export function RelatedItemsRow({ items, onAdd, addedItems }: RelatedItemsRowProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          Recommended add-ons
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <RelatedItemCard
            key={`${item.id}-${index}`}
            item={item}
            onAdd={onAdd}
            isAdded={!!addedItems[item.id]}
          />
        ))}
      </div>
    </div>
  );
}

