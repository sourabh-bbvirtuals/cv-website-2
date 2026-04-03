import { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const SortAndShow = () => {
  const [show, setShow] = useState('16');

  // Set the flag to true on component mount
  // useEffect(() => {
  //   if (!router.isReady) return; // Wait for the router to be ready
  //   // Your router logic here
  // }, [router]);

  // const handleShowChange = (value: string) => {
  //   setShow(value);
  //   const newQuery = { ...router.query, limit: value };
  //   router.push({ pathname: router.pathname, query: newQuery });
  // };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <Label className="text-gray-500">Sort:</Label>
        <Select defaultValue="low-high">
          <SelectTrigger className="w-[130px] rounded-xl border-gray-200 text-gray-700 font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl text-gray-700 font-medium">
            <SelectItem value="low-high">Low to High</SelectItem>
            <SelectItem value="high-low">High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-gray-500">Show:</Label>

        <Select value={show} onValueChange={console.log}>
          <SelectTrigger className="w-[80px] rounded-xl border-gray-200 text-gray-700 font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl text-gray-700 font-medium">
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="24">24</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SortAndShow;
