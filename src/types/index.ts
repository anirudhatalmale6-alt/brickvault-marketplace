export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "buyer" | "seller" | "admin";
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category_id: string;
  theme_id: string | null;
  set_number: string | null;
  piece_count: number | null;
  year_released: number | null;
  condition: "new_sealed" | "new_open" | "used_complete" | "used_incomplete" | "parts_lot";
  price: number;
  currency: string;
  location: string;
  images: string[] | null;
  status: "draft" | "pending" | "active" | "sold" | "removed";
  listing_type: "fixed" | "offers" | "auction" | "buy_now_auction";
  minimum_bid: number | null;
  bid_increment: number | null;
  auction_end_at: string | null;
  reserve_price: number | null;
  auto_accept_price: number | null;
  investment_score: number | null;
  views: number;
  whatsapp_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  buyer_id: string;
  seller_id: string;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "disputed";
  shipping_address: Record<string, string> | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  listing_id: string;
  quantity: number;
  price: number;
  listings?: Partial<Listing>;
};

export type CartItem = {
  id: string;
  user_id: string;
  listing_id: string;
  quantity: number;
  created_at: string;
  listings?: Partial<Listing>;
};

export type Offer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  counter_amount: number | null;
  status: "pending" | "accepted" | "rejected" | "countered" | "withdrawn";
  message: string | null;
  created_at: string;
  updated_at: string;
  listings?: Partial<Listing>;
  profiles?: Partial<Profile>;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string | null;
  created_at: string;
  listings?: Partial<Listing> | null;
  last_message?: Partial<Message>;
  unread_count?: number;
};
