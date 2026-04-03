// ClientSortAndShow.tsx

import dynamic from 'next/dynamic';

const SortAndShow = dynamic(() => import('./sort'), { ssr: false });

export default SortAndShow;
