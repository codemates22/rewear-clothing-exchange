export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  size: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  category: string;
  images: string[];
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  location: string;
  listed_date: string;
  status: 'Available' | 'Swapped' | 'Reserved';
}

export const sampleItems: ClothingItem[] = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket in excellent condition. Perfect for layering.',
    size: 'M',
    condition: 'Like New',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'
    ],
    owner: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    location: 'Portland, OR',
    listed_date: '2024-01-15',
    status: 'Available'
  },
  {
    id: '2',
    title: 'Floral Summer Dress',
    description: 'Beautiful floral print dress, perfect for summer events.',
    size: 'S',
    condition: 'Good',
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa'
    ],
    owner: {
      id: 'user2',
      name: 'Emily Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
    },
    location: 'Seattle, WA',
    listed_date: '2024-01-20',
    status: 'Available'
  },
  {
    id: '3',
    title: 'Wool Winter Coat',
    description: 'Warm and stylish winter coat in dark grey.',
    size: 'L',
    condition: 'New',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3'
    ],
    owner: {
      id: 'user3',
      name: 'Michael Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    location: 'Boston, MA',
    listed_date: '2024-01-25',
    status: 'Available'
  }
];