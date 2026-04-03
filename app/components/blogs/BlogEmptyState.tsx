import { FileTextIcon } from 'lucide-react';

export function BlogEmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileTextIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No blogs found
      </h3>
      <p className="text-gray-600 max-w-sm mx-auto">
        Try a different search term or check back later for new posts.
      </p>
    </div>
  );
}
