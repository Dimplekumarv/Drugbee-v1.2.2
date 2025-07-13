import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Search, Plus, X, ChevronLeft, ChevronRight, Play, Upload, FileText } from 'lucide-react';
import { Purchase, PurchaseItem, Vendor, Product } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import VendorManagement from './VendorManagement';
import BatchSelector from './BatchSelector';
import PurchaseListView from './PurchaseListView';
import PurchaseDetailView from './PurchaseDetailView';
import { parseCSVFile, processPDFInvoice, processOCRImage } from '../../utils/fileProcessing';
import toast from 'react-hot-toast';

interface UploadedFile {
  type: string;
  name: string;
  path: string;
  size: number;
}

// UUID validation helper
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const PurchaseManagement: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // View state
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'detail'>('list');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseType, setPurchaseType] = useState<'invoice' | 'delivery_challan'>('invoice');
  const [withGst, setWithGst] = useState<'yes' | 'no'>('yes');

  // Form state variables are now managed individually

  const [items, setItems] = useState<PurchaseItem[]>([{
    sku: undefined,
    product_id: '',
    product_name: '',
    batch: '',
    quantity: 0,
    price: 0,
    mrp: 0,
    expiry_date: new Date().toISOString().split('T')[0],
    gst_percentage: 12,
    discount: 0,
    total: 0,
    hsn_code: '',
    pack_units: '',
    cgst: 6,
    sgst: 6,
    free_quantity: 0,
    scheme: null,
    scheme_percentage: 0,
    expiryDisplayValue: ''
  }]);

  // Vendor and form state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentDueDate, setPaymentDueDate] = useState<string>('');
  const [billDiscount, setBillDiscount] = useState<string>('0');
  const [paymentType, setPaymentType] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');

  // Fetch and update vendors
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('id, name, contact_person, phone, email, address, city, state, country, zip, gst_number, drug_license, is_active, created_at')
          .order('name');

        if (error) throw error;
        setVendors(data || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Error loading vendors');
      }
    };

    loadVendors();
  }, []);

  // Vendor management
  const [showVendorManagement, setShowVendorManagement] = useState(false);

  const handleVendorAdd = (vendor: Vendor) => {
    if (!vendor.name || !vendor.contact_person || !vendor.phone) {
      toast.error('Name, Contact Person and Phone are required');
      return;
    }
    setVendors(prev => [...prev, {...vendor, created_at: new Date().toISOString()}]);
    setSelectedVendor(vendor.id);
    toast.success('Vendor added successfully');
  };

  const handleVendorUpdate = (vendor: Vendor) => {
    setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
    toast.success('Vendor updated successfully');
  };

  const handleVendorDelete = (vendorId: number) => {
    setVendors(prev => prev.filter(v => v.id !== vendorId));
    if (selectedVendor === vendorId) {
      setSelectedVendor(null);
    }
    toast.success('Vendor deleted successfully');
  };

  // UI state
  const [showBatchSelector, setShowBatchSelector] = useState<number | null>(null);
  const [productSuggestions, setProductSuggestions] = useState<{ [key: number]: Product[] }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCreateProduct, setShowCreateProduct] = useState<number | null>(null);
  const [activeProductSearch, setActiveProductSearch] = useState<number | null>(null);

  // File upload refs
  const csvFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const ocrFileRef = useRef<HTMLInputElement>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalGst = items.reduce((sum, item) => sum + (item.quantity * item.price * ((item.cgst ?? 0) + (item.sgst ?? 0)) / 100), 0);
  const discountAmount = subtotal * (parseFloat(billDiscount) || 0) / 100;
  const netTotal = subtotal + totalGst - discountAmount;

  // Enhanced product search function with Supabase integration
  const searchProductsEnhanced = async (searchTerm: string): Promise<Product[]> => {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,composition.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%,hsn_code.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .limit(15);

      if (error) {
        console.error('Error searching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  // Handle product search and suggestions
  const handleProductSearch = async (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].product_name = value;
    setItems(newItems);

    if (value.length >= 2) {
      const suggestions = await searchProductsEnhanced(value);
      setProductSuggestions(prev => ({ ...prev, [index]: suggestions }));
      setActiveProductSearch(index);
      
      // Show create product option if no matches found
      if (suggestions.length === 0) {
        setShowCreateProduct(index);
      } else {
        setShowCreateProduct(null);
      }
    } else {
      setProductSuggestions(prev => ({ ...prev, [index]: [] }));
      setActiveProductSearch(null);
      setShowCreateProduct(null);
    }
  };

  // Handle product selection with Supabase integration
  const handleProductSelect = async (product: Product, index: number) => {
    try {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: String(product.id),
        product_name: product.name,
        batch: newItems[index].batch || '',
        mrp: product.mrp,
        price: product.price || 0,
        gst_percentage: product.gst_percentage || 12,
        expiry_date: new Date().toISOString().split('T')[0],
        quantity: 0,
        discount: 0,
        total: 0,
        hsn_code: product.hsn_code,
        pack_units: product.pack_units,
        cgst: product.gst_percentage / 2,
        sgst: product.gst_percentage / 2,
        free_quantity: 0,
        scheme: null,
        scheme_percentage: 0
      };
      
      setItems(newItems);
      setProductSuggestions(prev => ({ ...prev, [index]: [] }));
      setActiveProductSearch(null);
      setShowCreateProduct(null);
      toast.success('Product added successfully');
    } catch (error) {
      toast.error('Error selecting product');
      console.error('Error selecting product:', error);
    }
  };

  // Calculate margin percentage with bill discount
  const calculateMargin = (mrp: number, rate: number, discount: number | undefined): number => {
    if (!mrp || !rate) return 0;
    
    // Apply item discount if it exists
    const discountedRate = rate * (1 - (discount || 0) / 100);
    
    // Apply bill discount
    const billDiscountRate = parseFloat(billDiscount) || 0;
    const finalRate = discountedRate * (1 - billDiscountRate / 100);
    
    const margin = ((mrp - finalRate) / mrp) * 100;
    return Math.max(0, margin);
  };

    const handleExpiryChange = (index: number, value: string) => {
      const newItems = [...items];
      
      // Remove any non-digit and non-slash characters
      value = value.replace(/[^\d/]/g, '');
      
      // Don't allow more than 5 characters (MM/YY)
      if (value.length <= 5) {
        // If exactly 2 digits are entered and no slash, add the slash
        if (value.length === 2 && !value.includes('/')) {
          const month = parseInt(value);
          // Only add slash if month is valid (1-12)
          if (month >= 1 && month <= 12) {
            value = value + '/';
          } else if (month > 12) {
            // If invalid month, take only first digit
            value = value.charAt(0);
          }
        }
        
        // Remove extra slashes
        value = value.replace(/\/{2,}/g, '/');
        
        // Store raw typed value for input display
        newItems[index].expiryDisplayValue = value;
        
        // Only update if it matches MM/YY pattern or is empty or partial
        if (value === '' || /^(\d{1,2}\/?\d{0,2})?$/.test(value)) {
          // Set a default expiry date until we have a valid format
          newItems[index].expiry_date = new Date().toISOString().split('T')[0];

          // If we have a complete MM/YY format
          if (/^\d{2}\/\d{2}$/.test(value)) {
            const [month, year] = value.split('/');
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt('20' + year, 10);
            
            // Validate month and year range
            if (monthNum >= 1 && monthNum <= 12 && yearNum >= 2023 && yearNum <= 2050) {
              // Set to last day of the month for expiry
              const date = new Date(yearNum, monthNum, 0);
              newItems[index].expiry_date = date.toISOString().split('T')[0];
            }
          }
        }
      }

      setItems(newItems);
};


// Get expiry status for color coding
const getExpiryStatus = (expiryDate: Date) => {
  const today = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  if (expiryDate < today) return 'expired';
  if (expiryDate <= sixMonthsFromNow) return 'near-expiry';
  return 'good';
};


// Format expiry date for display in input fields
const formatExpiryForDisplay = (item: PurchaseItem) => {
  if (item.expiryDisplayValue) {
    return item.expiryDisplayValue;
  }
  // If no display value, format from expiry_date
  if (item.expiry_date) {
    const date = new Date(item.expiry_date);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }
  return '';
};

  // Handle item field changes with auto-calculation
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total and margin
    if (field === 'quantity' || field === 'price' || field === 'discount' || field === 'mrp') {
      const item = newItems[index];
      const baseAmount = item.quantity * item.price;
      const discountAmount = baseAmount * ((item.discount ?? 0) / 100);
      const taxableAmount = baseAmount - discountAmount;
      const gstAmount = taxableAmount * ((item.cgst ?? 0) + (item.sgst ?? 0)) / 100;
      newItems[index].total = taxableAmount + gstAmount;
    }
    
    setItems(newItems);
  };

  // Handle keyboard navigation and auto-add rows
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentElement = e.target as HTMLElement;
    const currentRow = parseInt(currentElement.getAttribute('data-row') || '0', 10);
    const currentField = currentElement.getAttribute('data-field');
    
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      const allFields = [
        'product_name', 'hsn_code', 'batch', 'expiry', 'pack_units',
        'quantity', 'free_quantity', 'mrp', 'price', 'scheme',
        'scheme_percentage', 'discount'
      ];
      
      const currentFieldIndex = allFields.indexOf(currentField || '');
      const nextFieldIndex = currentFieldIndex + 1;
      
      if (nextFieldIndex < allFields.length) {
        // Move to next field in same row
        e.preventDefault();
        const nextInput = document.querySelector(
          `[data-row="${currentRow}"][data-field="${allFields[nextFieldIndex]}"]`
        ) as HTMLElement;
        nextInput?.focus();
      } else if (currentRow === items.length - 1) {
        // Add new row when at last field of last row
        e.preventDefault();
        handleAddItem();
      } else {
        // Move to first field of next row
        e.preventDefault();
        const nextInput = document.querySelector(
          `[data-row="${currentRow + 1}"][data-field="product_name"]`
        ) as HTMLElement;
        nextInput?.focus();
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      // Handle backward tab
      const allInputs = Array.from(document.querySelectorAll('[data-row][data-field]'));
      const currentIndex = allInputs.indexOf(currentElement);
      if (currentIndex > 0) {
        e.preventDefault();
        (allInputs[currentIndex - 1] as HTMLElement).focus();
      }
    }
  };

  // Add new item row
  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      sku: undefined,
      product_id: '',
      product_name: '',
      batch: '',
      quantity: 0,
      price: 0,
      mrp: 0,
      expiry_date: new Date().toISOString().split('T')[0],
      expiryDisplayValue: '',
      gst_percentage: 12,
      discount: 0,
      total: 0,
      hsn_code: '',
      pack_units: '',
      cgst: 6,
      sgst: 6,
      free_quantity: 0,
      scheme: null,
      scheme_percentage: 0
    };
    setItems(prevItems => [...prevItems, newItem]);
    setProductSuggestions(prev => ({ ...prev }));
    setActiveProductSearch(null);
    
    // Focus on the product name field of the new row after a short delay
    setTimeout(() => {
      const inputs = document.querySelectorAll('[data-field="product_name"]');
      const lastInput = inputs[inputs.length - 1] as HTMLElement;
      lastInput?.focus();
    }, 100);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      // Clear suggestions for removed item
      setProductSuggestions(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  // Handle create new product
  const handleCreateProduct = (index: number) => {
    const productName = items[index].product_name;
    toast.success(`Redirecting to create product: ${productName}`);
    // Here you would typically navigate to the products page
  };

  interface FileUploadResult {
    vendorName?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    items: PurchaseItem[];
  }

  // Handle file uploads
  const handleFileUpload = async (file: File, type: 'csv' | 'pdf' | 'ocr') => {
    setIsProcessing(true);
    setUploadProgress(0);
    
    // Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('purchase-documents')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload file');
      return;
    }

    // Add to uploaded files list
    setUploadedFiles(prev => [...prev, {
      type: type,
      name: file.name,
      path: uploadData.path,
      size: file.size
    }]);

    try {
      let extractedData: FileUploadResult;
      
      if (type === 'csv') {
        const csvItems = await parseCSVFile(file);
        extractedData = { items: csvItems };
        setItems(extractedData.items);
      } else if (type === 'pdf') {
        extractedData = await processPDFInvoice(file);
        // Find vendor by name
        if (extractedData.vendorName) {
          const matchingVendor = vendors.find(v => v.name === extractedData.vendorName);
          setSelectedVendor(matchingVendor?.id || null);
        }
        if (extractedData.invoiceNumber) setInvoiceNumber(extractedData.invoiceNumber);
        if (extractedData.invoiceDate) setInvoiceDate(extractedData.invoiceDate);
        setItems(extractedData.items);
      } else if (type === 'ocr') {
        extractedData = await processOCRImage(file);
        // Find vendor by name
        if (extractedData.vendorName) {
          const matchingVendor = vendors.find(v => v.name === extractedData.vendorName);
          setSelectedVendor(matchingVendor?.id || null);
        }
        if (extractedData.invoiceNumber) setInvoiceNumber(extractedData.invoiceNumber);
        if (extractedData.invoiceDate) setInvoiceDate(extractedData.invoiceDate);
        setItems(extractedData.items);
      }

      toast.success(`${type.toUpperCase()} file processed successfully`);
    } catch (error) {
      toast.error(`Failed to process ${type.toUpperCase()} file`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedVendor || !invoiceNumber || !invoiceDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (paymentType === 'Credit' && !paymentDueDate) {
      toast.error('Payment due date is required for credit purchases');
      return;
    }

    const vendor = vendors.find(v => v.id === selectedVendor);
    if (!vendor) {
      toast.error('Selected vendor not found');
      return;
    }

    // Filter out empty items and validate required fields
    const validItems = items.filter(item => 
      item.product_name && 
      item.product_name.trim() !== '' && 
      item.quantity > 0
    );
    
    if (validItems.length === 0) {
      toast.error('Please add at least one item to the purchase');
      return;
    }

    // Validate required fields for each item
    const invalidItems = validItems.filter(item => 
      !item.mrp || 
      item.mrp <= 0 || 
      !item.price || 
      item.price < 0
    );
    
    if (invalidItems.length > 0) {
      toast.error('Please enter valid MRP and price for all items');
      return;
    }

    // Check for items with invalid product_id format (if provided)
    const itemsWithInvalidUUID = validItems.filter(item => 
      item.product_id && 
      item.product_id.trim() !== '' && 
      !isValidUUID(item.product_id)
    );
    
    if (itemsWithInvalidUUID.length > 0) {
      toast.error('Some items have invalid product IDs. Please re-select products from the dropdown.');
      return;
    }

    try {
      // Calculate totals for the purchase
      const purchaseTotal = validItems.reduce((sum, item) => sum + item.total, 0);
      const purchaseTax = validItems.reduce((sum, item) => {
        const itemTax = (item.cgst || 0) + (item.sgst || 0);
        return sum + (item.price * item.quantity * (itemTax / 100));
      }, 0);

      // Ensure valid dates by adding time component
      const invoiceDateWithTime = new Date(invoiceDate + 'T00:00:00Z');
      // Handle optional payment due date
      const paymentDueDateWithTime = paymentDueDate ? new Date(paymentDueDate + 'T00:00:00Z') : null;

      // Prepare purchase data with validation
      const purchasePayload = {
        vendor_id: selectedVendor,
        vendor_name: vendor.name,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDateWithTime.toISOString(),
        payment_due_date: paymentType === 'Credit' ? paymentDueDateWithTime?.toISOString() : null,
        purchase_type: purchaseType,
        subtotal: Number((purchaseTotal - purchaseTax).toFixed(2)),
        tax: Number(purchaseTax.toFixed(2)),
        discount: Number((parseFloat(billDiscount) || 0).toFixed(2)),
        total: Number(netTotal.toFixed(2)),
        payment_status: paymentType === 'Credit' ? 'pending' : 'paid',
        payment_type: paymentType,
        payment_reference: null,
        upload_method: uploadedFiles.length > 0 ? 'file_import' : 'manual',
        gst_number: vendor.gst_number || null,
        notes: null,
        created_by: 'current_user'
      };

      console.log('Inserting purchase with data:', JSON.stringify(purchasePayload, null, 2));

      // First, create the main purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert(purchasePayload)
        .select()
        .single();

      if (purchaseError) {
        console.error('Purchase insert error:', {
          code: purchaseError.code,
          message: purchaseError.message,
          details: purchaseError.details,
          hint: purchaseError.hint
        });
        throw purchaseError;
      }
      
      if (!purchaseData) throw new Error('Failed to create purchase record');

      // Validate and prepare purchase items data
      const purchaseItems = validItems.map(item => {
        const productId = item.product_id && isValidUUID(item.product_id) ? item.product_id : null;
        
        return {
          purchase_id: purchaseData.id,
          purchase_order_id: purchaseData.id,
          product_id: productId,
          product_name: item.product_name || '',
          quantity: item.quantity || 0,
          free_quantity: item.free_quantity || 0,
          rate: item.price || 0,
          mrp: item.mrp || 0,
          discount_percentage: item.discount || 0,
          scheme: item.scheme || null,
          scheme_percentage: item.scheme_percentage || 0,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
          total: item.total || (item.quantity * (item.price || 0)),
          batch: item.batch || null,
          expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString() : null,
          hsn_code: item.hsn_code || null,
          pack_units: item.pack_units || null,
          margin_percentage: calculateMargin(item.mrp, item.price, item.discount),
          vendor_name: vendor.name,
          invoice_number: invoiceNumber,
          purchase_date: invoiceDateWithTime.toISOString(),
          sku: item.hsn_code || `SKU-${(item.product_name || 'UNKNOWN').replace(/\s+/g, '-').toUpperCase()}`,
          created_by: 'current_user'
        };
      });

      // Try to insert purchase items, but continue if table doesn't exist
      try {
        // Check authentication status
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('Current user:', user);
        console.log('Auth error:', authError);
        
        // Log the data being inserted for debugging
        console.log('Attempting to insert purchase items:', JSON.stringify(purchaseItems, null, 2));
        
        // Validate that all required fields are present
        const invalidItems = purchaseItems.filter(item => 
          !item.purchase_id || 
          !item.product_name || 
          item.quantity == null || 
          item.rate == null
        );
        
        if (invalidItems.length > 0) {
          console.error('Invalid items found:', invalidItems);
          throw new Error(`${invalidItems.length} items have missing required fields`);
        }
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('purchase_items')
          .insert(purchaseItems);

        if (itemsError) {
          console.error('Purchase items error details:', {
            code: itemsError.code,
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint
          });

          // Handle different error types
          if (itemsError.code === '42P01') {
            console.warn('purchase_items table not found, skipping item details');
            toast.error('Purchase saved successfully, but item details table is missing. Contact administrator to create purchase_items table.');
          } else if (itemsError.code === 'PGRST106') {
            console.warn('purchase_items table not accessible via API, skipping item details');
            toast.error('Purchase saved successfully, but item details table is not accessible. Check RLS policies.');
          } else if (itemsError.code === '42501') {
            console.warn('RLS policy violation on purchase_items table');
            toast.error('Purchase saved successfully, but item details blocked by security policy. Contact administrator to fix RLS policies.');
          } else if (itemsError.code === 'PGRST301') {
            console.warn('purchase_items table not found in API schema');
            toast.error('Purchase saved successfully, but item details table not found in API. Contact administrator.');
          } else if (itemsError.code === '22P02') {
            console.error('Invalid UUID format in purchase items');
            toast.error('Purchase saved but item details failed: Invalid product ID format. Please ensure all products are properly selected.');
          } else if (itemsError.code === '23503') {
            console.error('Foreign key constraint violation');
            toast.error('Purchase saved but item details failed: Referenced product or purchase not found.');
          } else {
            console.error('Unexpected error saving purchase items:', itemsError);
            toast.error(`Purchase saved but item details failed: ${itemsError.message}`);
          }
        } else {
          console.log('Purchase items saved successfully:', itemsData);
          toast.success('Purchase and item details saved successfully!');
        }
      } catch (error: any) {
        console.error('Unexpected error saving purchase items:', error);
        if (error.code === '42P01') {
          console.warn('purchase_items table not found, skipping item details');
          toast.error('Purchase saved successfully, but item details table is missing. Contact administrator to create purchase_items table.');
        } else if (error.code === '42501') {
          console.warn('RLS policy violation on purchase_items table');
          toast.error('Purchase saved successfully, but item details blocked by security policy. Contact administrator to fix RLS policies.');
        } else if (error.code === 'PGRST106' || error.code === 'PGRST301') {
          console.warn('purchase_items table not accessible via API');
          toast.error('Purchase saved successfully, but item details table not accessible. Contact administrator.');
        } else {
          throw error;
        }
      }
      
      // Update inventory for each item (with enhanced error handling and batch tracking)
      for (const item of validItems) {
        try {
          // Skip inventory update if product_id is not a valid UUID
          if (!item.product_id || !isValidUUID(item.product_id)) {
            console.warn(`Skipping inventory update for item with invalid product_id: ${item.product_id}`);
            continue;
          }

          const newQuantity = item.quantity + (item.free_quantity || 0);
          
          // First check if the product exists in inventory
          const { data: existingInventory, error: checkError } = await supabase
            .from('inventory')
            .select('hsn_code, current_stock, batches')
            .eq('product_id', item.product_id)
            .single();
          
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
            // If table doesn't exist, log warning and continue
            if (checkError.code === '42P01') {
              console.warn('Inventory table not found, skipping inventory update');
              continue;
            }
            throw checkError;
          }

          // Prepare batch information
          const batchInfo = {
            batch_number: item.batch || `B${Date.now()}`,
            quantity: newQuantity,
            expiry_date: item.expiry_date,
            purchase_price: item.price,
            mrp: item.mrp,
            vendor_name: vendor.name,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDateWithTime.toISOString()
          };

          if (!existingInventory) {
            // Insert new inventory record with batch tracking
            const { error: insertError } = await supabase
              .from('inventory')
              .insert({
                product_id: item.product_id,
                product_name: item.product_name,
                current_stock: newQuantity,
                opening_stock: newQuantity,
                cost_price: item.price,
                selling_price: item.mrp,
                mrp: item.mrp,
                unit: 'piece',
                pack_size: item.pack_units || '',
                hsn_code: item.hsn_code || '',
                gst_percentage: (item.cgst || 0) + (item.sgst || 0),
                vendor_name: vendor.name,
                invoice_number: invoiceNumber,
                invoice_date: invoiceDateWithTime.toISOString(),
                batches: [batchInfo],
                created_by: 'current_user',
                updated_by: 'current_user',
                is_active: true
              });

            if (insertError) throw insertError;
          } else {
            // Update existing inventory record with new batch
            const currentBatches = existingInventory.batches || [];
            const updatedBatches = [...currentBatches, batchInfo];
            
            const { error: updateError } = await supabase
              .from('inventory')
              .update({
                current_stock: existingInventory.current_stock + newQuantity,
                cost_price: item.price,
                mrp: item.mrp,
                vendor_name: vendor.name,
                invoice_number: invoiceNumber,
                invoice_date: invoiceDateWithTime.toISOString(),
                batches: updatedBatches,
                updated_at: new Date().toISOString(),
                updated_by: 'current_user',
                hsn_code: item.hsn_code || existingInventory.hsn_code,
                gst_percentage: (item.cgst || 0) + (item.sgst || 0)
              })
              .eq('product_id', item.product_id);

            if (updateError) throw updateError;
          }

          // Record the transaction
          const { error: transactionError } = await supabase
            .from('inventory_transactions')
            .insert({
              product_id: item.product_id, // Already validated as UUID above
              transaction_type: 'purchase',
              quantity: newQuantity,
              unit_cost: item.price || 0,
              unit_price: item.mrp || 0,
              transaction_date: invoiceDateWithTime.toISOString(),
              reference_number: invoiceNumber,
              created_by: 'current_user',
              notes: `Purchase from ${vendor.name}`
            });

          if (transactionError) {
            // If inventory_transactions table doesn't exist, log warning and continue
            if (transactionError.code === '42P01') {
              console.warn('Inventory transactions table not found, skipping transaction record');
            } else {
              throw transactionError;
            }
          }
        } catch (inventoryError: any) {
          // Log inventory errors but don't fail the entire purchase
          console.error('Inventory update error:', inventoryError);
          if (inventoryError.code !== '42P01') {
            // Only throw if it's not a missing table error
            throw inventoryError;
          }
        }
      }

      // Note: purchase_summary is now a VIEW, so no manual insert needed
      // The view will automatically show data from the purchases table

      // If there are any uploaded documents, save them
      if (uploadedFiles.length > 0) {
        const documents = uploadedFiles.map(file => ({
          purchase_id: purchaseData.id, // This should match the id from purchaseData
          document_type: file.type,
          file_name: file.name,
          file_path: file.path,
          file_size: file.size,
          uploaded_by: 'current_user' // Replace with actual user ID from auth context
        }));

        try {
          const { error: documentsError } = await supabase
            .from('purchase_documents')
            .insert(documents);

          if (documentsError && documentsError.code !== '42P01') {
            throw documentsError;
          }
          
          if (documentsError && documentsError.code === '42P01') {
            console.warn('purchase_documents table not found, skipping document storage');
            toast.error('Documents not saved. Please create missing tables.');
          }
        } catch (error: any) {
          if (error.code === '42P01') {
            console.warn('purchase_documents table not found, skipping document storage');
            toast.error('Documents not saved. Please create missing tables.');
          } else {
            throw error;
          }
        }
      }

      // Fetch updated purchases list
      const { data: updatedPurchases } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (updatedPurchases) {
        setPurchases(updatedPurchases);
      }

      toast.success('Purchase saved successfully');
      resetForm();
      setCurrentView('list');
    } catch (error: any) {
      console.error('Error saving purchase:', error);
      toast.error(error.message || 'Failed to save purchase');
    }
  };

  const resetForm = () => {
    setSelectedVendor(null);
    setInvoiceNumber('');
    setInvoiceDate('');
    setPaymentDueDate('');
    setBillDiscount('');
    setUploadedFiles([]);
    setItems([{
      sku: undefined,
      product_id: '',
      product_name: '',
      batch: '',
      quantity: 0,
      price: 0,
      mrp: 0,
      expiry_date: new Date().toISOString().split('T')[0],
      expiryDisplayValue: '',
      gst_percentage: 12,
      discount: 0,
      total: 0,
      hsn_code: '',
      pack_units: '',
      cgst: 6,
      sgst: 6,
      free_quantity: 0,
      scheme: null,
      scheme_percentage: 0
    }]);
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setCurrentView('detail');
  };

  const handleEditPurchase = (purchase: Purchase) => {
    // Load purchase data into form
    setSelectedVendor(purchase.vendor_id);
    setInvoiceNumber(purchase.invoice_number);
    setInvoiceDate(purchase.invoice_date);
    setItems(purchase.items);
    setCurrentView('add');
  };

  const handleDeletePurchase = (purchaseId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      setPurchases(prev => prev.filter(p => p.id !== purchaseId));
      toast.success('Purchase deleted successfully');
    }
  };

  // Render based on current view
  if (currentView === 'list') {
    return (
      <PurchaseListView
        purchases={purchases}
        vendors={vendors}
        onAddPurchase={() => setCurrentView('add')}
        onViewPurchase={handleViewPurchase}
        onEditPurchase={handleEditPurchase}
        onDeletePurchase={handleDeletePurchase}
      />
    );
  }

  if (currentView === 'detail' && selectedPurchase) {
    return (
      <PurchaseDetailView
        purchase={selectedPurchase}
        onBack={() => setCurrentView('list')}
        onEdit={() => handleEditPurchase(selectedPurchase)}
        onDelete={() => {
          handleDeletePurchase(selectedPurchase.id || '');
          setCurrentView('list');
        }}
      />
    );
  }

  // Add Purchase Form
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentView('list')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Add Purchase</h1>
            </div>
            <button
              onClick={handleSave}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save (Alt + S)</span>
            </button>
          </div>
        </div>

        {/* Purchase Details Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Purchase Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PURCHASE TYPE</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="purchaseType"
                    value="invoice"
                    checked={purchaseType === 'invoice'}
                    onChange={(e) => setPurchaseType(e.target.value as 'invoice')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">INVOICE</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="purchaseType"
                    value="delivery_challan"
                    checked={purchaseType === 'delivery_challan'}
                    onChange={(e) => setPurchaseType(e.target.value as 'delivery_challan')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">DELIVERY CHALLAN</span>
                </label>
              </div>
              <button className="text-xs text-blue-600 hover:underline mt-1">what's the difference?</button>
            </div>

            {/* With GST */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WITH GST?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="withGst"
                    value="yes"
                    checked={withGst === 'yes'}
                    onChange={(e) => setWithGst(e.target.value as 'yes')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">YES</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="withGst"
                    value="no"
                    checked={withGst === 'no'}
                    onChange={(e) => setWithGst(e.target.value as 'no')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">NO</span>
                </label>
              </div>
            </div>

            {/* Distributor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DISTRIBUTOR NAME <span className="text-red-500">*REQUIRED</span>
              </label>
              <div className="relative">
                <select
                  value={selectedVendor || ''}
                  onChange={(e) =>
                    setSelectedVendor(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} {vendor.gst_number ? `(GSTIN: ${vendor.gst_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowVendorManagement(true)}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                Add vendor
              </button>
            </div>

            {/* Invoice No */}
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                INVOICE NO <span className="text-red-500">*</span>
              </label>
              <input
                id="invoiceNumber"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice No"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                aria-required="true"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-2">
                INVOICE DATE <span className="text-red-500">*</span>
              </label>
              <input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                aria-required="true"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAYMENT TYPE</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as 'Cash' | 'UPI' | 'Card' | 'Credit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            {/* Payment Due Date */}
            <div>
              <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-700 mb-2">
               PAYMENT DUE DATE {paymentType === 'Credit' ? <span className="text-red-500">*</span> : <span className="text-gray-400 text-sm">(optional)</span>}
              </label>
              <input
               id='paymentDueDate'
               type="date"
               value={paymentDueDate}
               onChange={(e) => setPaymentDueDate(e.target.value)}
               min={new Date().toISOString().split('T')[0]} // sets today's date as minimum
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
               required={paymentType === 'Credit'}
              />
            </div>
          </div>

          {/* Expiry Legend */}
          <div className="flex justify-end items-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Near Expiry Batches</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Expired Batches</span>
            </div>
          </div>
        </div>

        {/* Product Entry Table with Dedicated Search Results Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12">
          <div className="overflow-x-auto pb-60">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT / BARCODE</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BATCH</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EXPIRY</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PACK</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QTY</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FREE</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RATE</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SCHEME</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SCH %</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DISC</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MARGIN %</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL RATE</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">ACTIONS</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const expiryStatus = getExpiryStatus(new Date(item.expiry_date));
                  const expiryBgColor = expiryStatus === 'expired' ? 'bg-red-100' : 
                                       expiryStatus === 'near-expiry' ? 'bg-yellow-100' : '';
                  const marginPercent = calculateMargin(item.mrp, item.price, item.discount);
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-1 py-1 text-sm text-gray-900 border-r border-gray-200">{index + 1}</td>
                      
                      {/* Product Name with Enhanced Search Results Display */}
                      <td className="px-0 py-0 relative border-r border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => handleProductSearch(index, e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type product name or scan barcode"
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            data-row={index}
                            data-field="product_name"
                          />
                          <Search className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2" />
                        </div>

                        {/* Product Search Results */}
                        {activeProductSearch === index && productSuggestions[index] && productSuggestions[index].length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                            <div className="p-3 border-b border-gray-100 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-700">Search Results ({productSuggestions[index].length})</h4>
                            </div>
                            <div className="max-h-64 overflow-y-auto w-80">
                              {productSuggestions[index].map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() => handleProductSelect(product, index)}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-b-0 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 mb-1">{product.name}</div>
                                      <div className="text-xs text-gray-600 mb-2">{product.composition}</div>
                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">HSN: {product.hsn_code}</span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Pack: {product.pack_units}</span>
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">MRP: ₹{product.mrp}</span>
                                      </div>
                                      <div className="text-xs text-blue-600 mt-1 font-medium">{product.manufacturer}</div>
                                    </div>
                                    <div className="ml-3 text-right">
                                      <div className="text-xs text-gray-500">Stock</div>
                                      <div className="text-sm font-medium text-gray-900">Min Stock: {product.min_stock || 0}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Create New Product Option */}
                        {showCreateProduct === index && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                            <div className="p-4 text-center">
                              <div className="text-sm text-gray-600 mb-3">No products found for "{item.product_name}"</div>
                              <button
                                onClick={() => handleCreateProduct(index)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 flex items-center space-x-2 mx-auto transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Create New Product</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      
                      {/* HSN - Auto-populated and editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={item.hsn_code || ''}
                          onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          placeholder="HSN"
                          data-row={index}
                          data-field="hsn_code"
                        />
                      </td>
                      
                      {/* Batch - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={item.batch}
                          onChange={(e) => handleItemChange(index, 'batch', e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Batch No"
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          data-row={index}
                          data-field="batch"
                        />
                      </td>
                      
                      {/* Expiry - Fully editable, no default value */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={formatExpiryForDisplay(item)}
                          onChange={(e) => handleExpiryChange(index, e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="MM/YY"
                          className={`w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${expiryBgColor}`}
                          maxLength={5}
                          data-row={index}
                          data-field="expiry"
                        />
                      </td>
                      
                      
                      {/* Pack - Auto-populated and editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={item.pack_units || ''}
                          onChange={(e) => handleItemChange(index, 'pack_units', e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="1 x 10"
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          data-row={index}
                          data-field="pack_units"
                        />
                      </td>
                      
                      {/* Quantity - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          min="0"
                          data-row={index}
                          data-field="quantity"
                        />
                      </td>
                      
                      {/* Free - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={item.free_quantity || ''}
                          onChange={(e) => handleItemChange(index, 'free_quantity', parseInt(e.target.value) || 0)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          min="0"
                          data-row={index}
                          data-field="free_quantity"
                        />
                      </td>
                      
                      {/* MRP - Auto-populated and editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={item.mrp || ''}
                          onChange={(e) => handleItemChange(index, 'mrp', parseFloat(e.target.value) || 0)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          step="0.01"
                          min="0"
                          data-row={index}
                          data-field="mrp"
                        />
                      </td>
                      
                      {/* Rate - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          step="0.01"
                          min="0"
                          data-row={index}
                          data-field="price"
                        />
                      </td>
                      
                      {/* Scheme - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={item.scheme || ''}
                          onChange={(e) => handleItemChange(index, 'scheme', e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          data-row={index}
                          data-field="scheme"
                        />
                      </td>
                      
                      {/* SCH % - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={item.scheme_percentage || ''}
                          onChange={(e) => handleItemChange(index, 'scheme_percentage', parseFloat(e.target.value) || 0)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          step="0.01"
                          min="0"
                          max="100"
                          data-row={index}
                          data-field="scheme_percentage"
                        />
                      </td>
                      
                      {/* Discount - Editable */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={item.discount || ''}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          step="0.01"
                          min="0"
                          max="100"
                          data-row={index}
                          data-field="discount"
                        />
                      </td>
                      
                      {/* GST % - New dedicated field */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={(item.cgst ?? 0) + (item.sgst ?? 0)}
                          onChange={(e) => {
                            const gst = parseFloat(e.target.value) || 12;
                            handleItemChange(index, 'cgst', gst / 2);
                            handleItemChange(index, 'sgst', gst / 2);
                          }}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          step="0.01"
                          min="0"
                          max="28"
                          data-row={index}
                          data-field="gst"
                        />
                      </td>
                      
                      {/* Margin % - Calculated automatically with bill discount */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <div className={`text-sm font-medium px-2 py-1 rounded text-center ${
                          marginPercent >= 20 ? 'bg-green-100 text-green-800' :
                          marginPercent >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {marginPercent.toFixed(1)}%
                        </div>
                      </td>
                      
                       {/* Overall Rate - Calculated automatically */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <div className="text-sm font-medium text-gray-900 text-center">
                          ₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                        </div>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-1 py-1 border-r border-gray-200">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete Item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAddItem()}
                            className="text-purple-500 hover:text-purple-700 p-1"
                            title="Add New Row"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button className="text-gray-400">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-full bg-gray-200 rounded-full h-2 mx-4">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <button className="text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-900 text-white rounded-lg p-4">
            <h3 className="text-purple-400 font-medium mb-4">Bill Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Subtotal:</span>
                <span className="float-right">₹ {subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Total GST:</span>
                <span className="float-right">₹ {totalGst.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Bill Discount ({billDiscount || 0}%):</span>
                <span className="float-right text-red-400">- ₹ {discountAmount.toFixed(2)}</span>
              </div>
              <div className="col-span-2 border-t border-gray-700 pt-2">
                <span className="text-green-400 font-medium">Net Total:</span>
                <span className="float-right text-green-400 font-medium">₹ {netTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bill Discount and Payment Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BILL DISCOUNT (%)</label>
                <input
                  type="number"
                  value={billDiscount}
                  onChange={(e) => setBillDiscount(e.target.value)}
                  placeholder="e.g., 5.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAYMENT TYPE</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=160&h=90&fit=crop"
                alt="Import illustration"
                className="w-20 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Tired of Manual Entries?</h4>
                <p className="text-sm text-gray-600">Automate your purchase bill entries with ease.</p>
                <button className="text-purple-600 text-sm flex items-center space-x-1 mt-1">
                  <Play className="w-3 h-3" />
                  <span>Watch Video</span>
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Import from CSV or PDF:</p>
                <div className="flex space-x-2">
                  <input
                    ref={csvFileRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'csv')}
                    className="hidden"
                  />
                  <button
                    onClick={() => csvFileRef.current?.click()}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300 flex items-center space-x-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Attach CSV File</span>
                  </button>
                  
                  <input
                    ref={pdfFileRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')}
                    className="hidden"
                  />
                  <button
                    onClick={() => pdfFileRef.current?.click()}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300 flex items-center space-x-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Attach PDF File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Management Modal */}
        {showVendorManagement && (
          <VendorManagement
            vendors={vendors}
            onVendorAdd={handleVendorAdd}
            onVendorUpdate={handleVendorUpdate}
            onVendorDelete={handleVendorDelete}
            onClose={() => setShowVendorManagement(false)}
          />
        )}

        {/* Batch Selector Modal */}
        {showBatchSelector !== null && (
          <BatchSelector
            fetchProducts={async (query: string) => {
              const { data } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`)
                .limit(10);
              return data || [];
            }}
            productName={items[showBatchSelector]?.product_name || ''}
            selectedBatch={items[showBatchSelector]?.batch}
            onBatchSelect={(product) => {
              handleProductSelect(product, showBatchSelector);
              setShowBatchSelector(null);
            }}
          />
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Processing File</h3>
                <p className="text-sm text-gray-600">Please wait while we extract the data...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseManagement;
