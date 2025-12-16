'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  allowCustom?: boolean;
  customLabel?: string;
  required?: boolean;
  error?: string;
}

export default function Select({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  searchable = false,
  allowCustom = false,
  customLabel = 'Other',
  required,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if current value is a custom value (not in options)
  const isCustomValue = value && !options.some(opt => opt.value === value);

  // Filter options based on search
  const filteredOptions = searchable && search
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
    setShowCustomInput(false);
  };

  const handleCustomSelect = () => {
    setShowCustomInput(true);
    setCustomValue(isCustomValue ? value : '');
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setShowCustomInput(false);
      setIsOpen(false);
    }
  };

  const displayValue = value
    ? options.find(opt => opt.value === value)?.label || value
    : '';

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 rounded-lg border text-left
            flex items-center justify-between
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-indigo-500 border-transparent' : ''}
            ${value ? 'text-gray-900' : 'text-gray-400'}
          `}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50
                      ${value === option.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No results found
                </div>
              )}

              {/* Custom option */}
              {allowCustom && (
                <>
                  <div className="border-t border-gray-100" />
                  {showCustomInput ? (
                    <div className="p-2">
                      <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="Enter custom value..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomSubmit();
                          }
                        }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(false)}
                          className="flex-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCustomSubmit}
                          className="flex-1 px-3 py-1.5 text-sm text-white bg-indigo-500 rounded-md hover:bg-indigo-600"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCustomSelect}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 text-indigo-600
                        ${isCustomValue ? 'bg-indigo-50 font-medium' : ''}
                      `}
                    >
                      + {customLabel}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
