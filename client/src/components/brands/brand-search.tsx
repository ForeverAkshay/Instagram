import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback } from "react";
import debounce from "lodash/debounce";

export default function BrandSearch({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch],
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10"
        placeholder="Search brands..."
        onChange={(e) => debouncedSearch(e.target.value)}
      />
    </div>
  );
}
