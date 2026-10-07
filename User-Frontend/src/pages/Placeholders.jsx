import React from 'react';
import CrudPlaceholder from '../components/CrudPlaceholder';
import { Building2, UserCheck, FileText, BellRing, Archive, TrendingUp, ShoppingCart, Receipt } from 'lucide-react';

export const Customers = () => <CrudPlaceholder title="Customers" description="Manage your customer directory, interactions, and details." icon={UserCheck} />;
export const Documents = () => <CrudPlaceholder title="Documents with Expiry" description="Track important documents and their expiry dates securely." icon={FileText} />;
export const Reminders = () => <CrudPlaceholder title="Reminders" description="Set and track important alerts and notifications." icon={BellRing} />;
export const Inventory = () => <CrudPlaceholder title="Stock / Inventory" description="Track your stock levels, movements, and valuations." icon={Archive} />;
export const Sales = () => <CrudPlaceholder title="Sales" description="Track sales orders, invoices, and revenue." icon={TrendingUp} />;
export const Purchases = () => <CrudPlaceholder title="Purchases" description="Manage purchase orders and supplier bills." icon={ShoppingCart} />;
export const Expenses = () => <CrudPlaceholder title="Expenses" description="Track business expenses, claims, and categories." icon={Receipt} />;
