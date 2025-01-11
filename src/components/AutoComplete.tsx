"use client";

    import React, { useState, useRef, useEffect } from 'react';
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import {
      DropdownMenu,
      DropdownMenuTrigger,
      DropdownMenuContent,
      DropdownMenuItem,
    } from "@/components/ui/dropdown-menu";
    import { ChevronDown } from 'lucide-react';

    interface AutoCompleteProps<T> {
      items: T[];
      onSelectedValueChange: (value: T | null) => void;
      searchValue: string;
      onSearchValueChange: (value: string) => void;
      isLoading?: boolean;
      emptyMessage?: string;
      placeholder?: string;
      renderItem: (item: T) => React.ReactNode;
      filterItems: (item: T, searchValue: string) => boolean;
    }

    const AutoComplete = <T,>({
      items,
      onSelectedValueChange,
      searchValue,
      onSearchValueChange,
      isLoading,
      emptyMessage = "No items found.",
      placeholder = "Search...",
      renderItem,
      filterItems,
    }: AutoCompleteProps<T>) => {
      const [dropdownOpen, setDropdownOpen] = useState(false);
      const inputRef = useRef<HTMLInputElement>(null);

      const filteredItems = items.filter(item => filterItems(item, searchValue));

      return (
        <div className="relative">
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => {
              onSearchValueChange(e.target.value);
              if (e.target.value) {
                setDropdownOpen(true);
              } else {
                setDropdownOpen(false);
              }
            }}
            placeholder={placeholder}
          />
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} focusOnOpen={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" style={{ width: inputRef.current?.offsetWidth }} >
              {isLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : filteredItems.length === 0 ? (
                <DropdownMenuItem disabled>{emptyMessage}</DropdownMenuItem>
              ) : (
                filteredItems.map((item, index) => (
                  <DropdownMenuItem key={index} onSelect={() => {
                    onSelectedValueChange(item);
                    onSearchValueChange(renderItem(item).toString());
                    setDropdownOpen(false);
                  }}>
                    {renderItem(item)}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    };

    export default AutoComplete;
