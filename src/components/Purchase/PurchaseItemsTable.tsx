import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { PurchaseItem, Product } from '../../types';
import AutocompleteProductSelector from './AutocompleteProductSelector';

interface PurchaseItemsTableProps {
  items: PurchaseItem[];
  onItemUpdate: (updatedItem: PurchaseItem, index: number) => void;
  onItemRemove: (index: number) => void;
  onAddItem: () => void;
  onProductSelect: (product: Product, index: number) => void;
  calculateMargin: (mrp: number, rate: number, discount: number) => number;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string) => void;
  getExpiryStatus: (expiryDate: Date) => string;
  handleExpiryChange: (index: number, value: string) => void;
}

const PurchaseItemsTable: React.FC<PurchaseItemsTableProps> = ({
  items,
  onItemUpdate,
  onItemRemove,
  onAddItem,
  onProductSelect,
  onKeyDown,
  calculateMargin,
  getExpiryStatus,
  handleExpiryChange,
}) => {
  const handleFieldChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItem = { ...items[index], [field]: value };
    onItemUpdate(updatedItem, index);
  };

  const formatExpiryDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Purchase Items</h3>
          <button
            onClick={onAddItem}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pack Units
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MRP
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disc%
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CGST%
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SGST%
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin%
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {/* Product Name */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="w-48">
                   


<AutocompleteProductSelector
  onProductSelect={(product) => onProductSelect(product, index)}
  placeholder="Search product..."
/>

                  
                  </div>
                </td>

                {/* Pack Units */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.packUnits}
                    onChange={(e) => handleFieldChange(index, 'packUnits', e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, index, 'packUnits')}
                    data-row={index}
                    data-field="packUnits"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1x10"
                  />
                </td>

                {/* Batch */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.batch}
                    onChange={(e) => handleFieldChange(index, 'batch', e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, index, 'batch')}
                    data-row={index}
                    data-field="batch"
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Batch"
                  />
                </td>

                {/* Expiry Date */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={(item as any).expiryDisplayValue || formatExpiryDate(item.expiryDate)}
                    onChange={(e) => handleExpiryChange(index, e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, index, 'expiry')}
                    data-row={index}
                    data-field="expiry"
                    className={`w-20 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500 ${
                      getExpiryStatus(item.expiryDate) === 'expired' 
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : getExpiryStatus(item.expiryDate) === 'near-expiry'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-300'
                    }`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </td>

                {/* Quantity */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => handleFieldChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, index, 'quantity')}
                    data-row={index}
                    data-field="quantity"
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="1"
                  />
                </td>

                {/* Rate */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.rate || ''}
                    onChange={(e) => handleFieldChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, index, 'rate')}
                    data-row={index}
                    data-field="rate"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </td>

                {/* MRP */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.mrp || ''}
                    onChange={(e) => handleFieldChange(index, 'mrp', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, index, 'mrp')}
                    data-row={index}
                    data-field="mrp"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </td>

                {/* Discount */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.discount || ''}
                    onChange={(e) => handleFieldChange(index, 'discount', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, index, 'discount')}
                    data-row={index}
                    data-field="discount"
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </td>

                {/* CGST */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.cgst || ''}
                    onChange={(e) => handleFieldChange(index, 'cgst', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, index, 'cgst')}
                    data-row={index}
                    data-field="cgst"
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                    step="0.01"
                  />
                </td>

                {/* SGST */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.sgst || ''}
                    onChange={(e) => handleFieldChange(index, 'sgst', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, index, 'sgst')}
                    data-row={index}
                    data-field="sgst"
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                    step="0.01"
                  />
                </td>

                {/* Total */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{item.total.toFixed(2)}
                  </div>
                </td>

                {/* Margin */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    calculateMargin(item.mrp ?? 0, item.rate ?? 0, item.discount ?? 0) < 10 
                      ? 'text-red-600' 
                      : calculateMargin(item.mrp ?? 0, item.rate ?? 0, item.discount ?? 0) < 20 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {calculateMargin(item.mrp ?? 0, item.rate ?? 0, item.discount ?? 0).toFixed(1)}%
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() => onItemRemove(index)}
                    disabled={items.length === 1}
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Keyboard Navigation Help */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <strong>Keyboard Navigation:</strong> Use Tab/Enter to move forward, Shift+Tab to move backward. 
          New row will be added automatically when you reach the last field of the last row.
        </div>
      </div>
    </div>
  );
};

export default PurchaseItemsTable;