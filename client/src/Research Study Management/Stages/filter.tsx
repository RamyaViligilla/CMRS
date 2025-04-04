import React, { useState } from 'react';
import { Input, Select, SelectItem } from '@nextui-org/react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { MdAllInclusive, MdLibraryBooks, MdPeople } from 'react-icons/md';
import { GiMicroscope } from 'react-icons/gi';
import { RiUserSearchFill } from 'react-icons/ri';

interface SearchFilterComponentProps {
  onSearch: (searchTerm: string, filterType: string) => void;
  onFilter: (searchTerm: string, filterType: string) => void;
  userType: string;
}

const SearchFilterComponent: React.FC<SearchFilterComponentProps> = ({
  onSearch,
  onFilter,
  userType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value, filterType);
  };

  const handleFilter = (value: string) => {
    setFilterType(value);
    onFilter(searchTerm, value);
  };

  const filterOptions = [
    {
      key: 'all',
      value: 'all',
      label: 'All',
      description: 'Show all studies',
      icon: <MdAllInclusive className="text-2xl text-purple-500" />,
    },
    {
      key: 'myStudies',
      value: 'myStudies',
      label: 'My Studies',
      description: 'Studies you created',
      icon: <MdLibraryBooks className="text-2xl text-blue-500" />,
    },
    {
      key: 'otherStudies',
      value: 'otherStudies',
      label: 'Other Studies',
      description: 'Studies by others',
      icon: <GiMicroscope className="text-2xl text-green-500" />,
    },
    {
      key: 'byPatient',
      value: 'byPatient',
      label: 'By Patient',
      description: 'Filter by patient',
      icon: <MdPeople className="text-2xl text-orange-500" />,
    },
    {
      key: 'byResearcher',
      value: 'byResearcher',
      label: 'By Researcher',
      description: 'Filter by researcher',
      icon: <RiUserSearchFill className="text-2xl text-red-500" />,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-xl shadow-lg mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <Input
          className="w-full md:w-2/3 bg-white dark:bg-gray-800"
          placeholder="Search by patient or researcher email"
          size="lg"
          startContent={<FaSearch className="text-purple-500" />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          className="w-full md:w-1/3 bg-white dark:bg-gray-800"
          placeholder="Filter by type"
          size="lg"
          startContent={<FaFilter className="text-purple-500" />}
          value={filterType}
          onChange={(e) => handleFilter(e.target.value)}
        >
          {filterOptions
            .filter((option) =>
              userType === 'patient'
                ? option.key !== 'myStudies' && option.key !== 'otherStudies'
                : true
            )
            .map((option) => (
              <SelectItem
                key={option.key}
                textValue={option.label}
                value={option.value}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <div className="flex flex-col">
                    <span className="text-lg">{option.label}</span>
                    <span className="text-tiny text-default-400">
                      {option.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
        </Select>
      </div>
    </div>
  );
};

export default SearchFilterComponent;
