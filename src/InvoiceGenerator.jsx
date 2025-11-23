import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Printer, RefreshCw, Upload, Lock, LogOut } from 'lucide-react';

const InvoiceGenerator = () => {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- INVOICE STATE ---
  const [invoiceData, setInvoiceData] = useState({
    logo: '/logo.png',
    companyName: 'Ktech Creatives',
    companyAddress: '10, Adisesha Nagar\n2nd Street, Perambur\nChennai-600 012.',
    companyPhone: '+91 81243 66648',
    companyEmail: 'karthikeyan@ktechcreatives.com',
    companyWebsite: 'ktechcreatives.com',
    customerId: '0925-01',
    date: '2025-09-01',
    clientName: 'COOL TRIP',
    items: [
      { id: 1, description: 'Website Balance', qty: 1, price: 20000 },
      { id: 2, description: 'Visiting Card', qty: 2, price: 2500 }
    ],
    taxRate: 18,
    bankName: 'P Karthikeyan',
    bankAccount: '434101516212',
    bankIfsc: 'ICIC0004341',
    terms: [
      'All rates quoted are valid for 15 days.',
      '50% payment should be done in advance.',
      'The remaining amount should be paid within 20 days of delivery.'
    ]
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef(null);

  // Load html2pdf script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --- LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    // HARDCODED CREDENTIALS - CHANGE THESE IF NEEDED
    if (loginId === 'admin' && loginPassword === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid User ID or Password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginId('');
    setLoginPassword('');
  };

  // --- CALCULATION HELPERS ---
  const calculateSubTotal = () => {
    return invoiceData.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  };

  const calculateTax = () => {
    return (calculateSubTotal() * invoiceData.taxRate) / 100;
  };

  const calculateGrandTotal = () => {
    return calculateSubTotal() + calculateTax();
  };

  // --- HANDLERS ---
  const handleInputChange = (e, field) => {
    setInvoiceData({ ...invoiceData, [field]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData({ ...invoiceData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setInvoiceData({ ...invoiceData, logo: null });
  };

  const handleItemChange = (id, field, value) => {
    const newItems = invoiceData.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'description' ? value : Number(value) };
      }
      return item;
    });
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const addItem = () => {
    const newId = invoiceData.items.length > 0 ? Math.max(...invoiceData.items.map(i => i.id)) + 1 : 1;
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { id: newId, description: 'New Item', qty: 1, price: 0 }]
    });
  };

  const removeItem = (id) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter(item => item.id !== id)
    });
  };

  const handleTermChange = (index, value) => {
    const newTerms = [...invoiceData.terms];
    newTerms[index] = value;
    setInvoiceData({ ...invoiceData, terms: newTerms });
  };

  const addTerm = () => {
    setInvoiceData({ ...invoiceData, terms: [...invoiceData.terms, 'New condition'] });
  };

  const removeTerm = (index) => {
    const newTerms = invoiceData.terms.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, terms: newTerms });
  };

  const handleDownloadPDF = () => {
    if (!window.html2pdf) {
      alert('PDF Generator is still loading, please try again in a moment.');
      return;
    }
    
    setIsGeneratingPdf(true);
    
    const element = invoiceRef.current;
    const opt = {
      margin: 0, 
      filename: `invoice_${invoiceData.customerId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
        setIsGeneratingPdf(false);
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- RENDER LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white">
               <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice Login</h1>
            <p className="text-gray-500 text-sm">Please enter your credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter User ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter Password"
              />
            </div>
            
            {loginError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER INVOICE APP (Protected) ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg"></div>
          Invoice Generator
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
          >
            <LogOut size={20} />
            Logout
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <Printer size={20} />
            Print
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isGeneratingPdf ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className="bg-white rounded-2xl shadow-xl p-6 h-fit overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
          <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">Edit Invoice Details</h2>
          
          {/* Header Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Company Info</h3>
            
            {/* Logo Upload Input */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Company Logo</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors border border-gray-300">
                  <Upload size={16} className="mr-2" />
                  <span className="text-sm">Change Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {invoiceData.logo && (
                  <button onClick={removeLogo} className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1">
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" 
                value={invoiceData.companyName}
                onChange={(e) => handleInputChange(e, 'companyName')}
                placeholder="Company Name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
              />
              <textarea 
                value={invoiceData.companyAddress}
                onChange={(e) => handleInputChange(e, 'companyAddress')}
                placeholder="Company Address"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none h-20"
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Customer ID</label>
                <input 
                  type="text" 
                  value={invoiceData.customerId}
                  onChange={(e) => handleInputChange(e, 'customerId')}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input 
                  type="date" 
                  value={invoiceData.date}
                  onChange={(e) => handleInputChange(e, 'date')}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Client Name</label>
                <input 
                  type="text" 
                  value={invoiceData.clientName}
                  onChange={(e) => handleInputChange(e, 'clientName')}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Items</h3>
              <button onClick={addItem} className="text-xs flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {invoiceData.items.map((item) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <input 
                    type="text" 
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-grow p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                  />
                  <input 
                    type="number" 
                    value={item.qty}
                    onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                    placeholder="Qty"
                    className="w-16 p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                  />
                  <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                    placeholder="Price"
                    className="w-24 p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                  />
                  <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
               <label className="text-sm text-gray-600">GST Rate (%):</label>
               <input 
                  type="number" 
                  value={invoiceData.taxRate}
                  onChange={(e) => handleInputChange(e, 'taxRate')}
                  className="w-20 p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                />
            </div>
          </div>

           {/* Footer Details */}
           <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Bank & Terms</h3>
            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" 
                value={invoiceData.bankName}
                onChange={(e) => handleInputChange(e, 'bankName')}
                placeholder="Account Name / Payable To"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="text" 
                  value={invoiceData.bankAccount}
                  onChange={(e) => handleInputChange(e, 'bankAccount')}
                  placeholder="Account No"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                />
                 <input 
                  type="text" 
                  value={invoiceData.bankIfsc}
                  onChange={(e) => handleInputChange(e, 'bankIfsc')}
                  placeholder="IFSC Code"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-500">Terms & Conditions</label>
                 <button onClick={addTerm} className="text-xs text-orange-600 hover:text-orange-800">+ Add Term</button>
              </div>
              {invoiceData.terms.map((term, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={term}
                    onChange={(e) => handleTermChange(idx, e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
                  />
                  <button onClick={() => removeTerm(idx)} className="text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
           {/* Contact Footer */}
           <div className="space-y-4">
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Contact Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <input 
                  type="text" 
                  value={invoiceData.companyPhone}
                  onChange={(e) => handleInputChange(e, 'companyPhone')}
                  placeholder="Phone"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
                />
                <input 
                  type="text" 
                  value={invoiceData.companyEmail}
                  onChange={(e) => handleInputChange(e, 'companyEmail')}
                  placeholder="Email"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
                />
                 <input 
                  type="text" 
                  value={invoiceData.companyWebsite}
                  onChange={(e) => handleInputChange(e, 'companyWebsite')}
                  placeholder="Website"
                  className="col-span-2 w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
                />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="flex justify-center">
            {/* The A4 Invoice Preview Wrapper */}
            <div className="bg-gray-200 p-4 rounded-xl shadow-inner overflow-x-auto w-full flex justify-center">
                
                {/* INVOICE CONTENT START */}
                <div 
                  ref={invoiceRef}
                  className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col justify-between"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    <div>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                {invoiceData.logo ? (
                                  <div className="mb-4">
                                    <img 
                                      src={invoiceData.logo} 
                                      alt="Company Logo" 
                                      className="h-20 w-auto object-contain" 
                                    />
                                    {invoiceData.companyName && (
                                       <h1 className="text-xl font-bold text-gray-800 mt-2">{invoiceData.companyName}</h1>
                                    )}
                                  </div>
                                ) : (
                                  <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight leading-tight mb-2">
                                    {invoiceData.companyName.split(' ')[0]} 
                                    <span className="relative inline-block ml-2">
                                      {invoiceData.companyName.split(' ').slice(1).join(' ')}
                                      <div className="absolute -top-2 -right-4 w-6 h-6 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full opacity-80 blur-[1px]"></div>
                                      <div className="absolute bottom-1 -left-1 w-full h-1 bg-pink-500 rounded-full"></div>
                                    </span>
                                  </h1>
                                )}
                                <p className="text-gray-500 text-sm whitespace-pre-line leading-relaxed max-w-[250px]">
                                    {invoiceData.companyAddress}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-500 tracking-wide mb-1">CUSTOMER ID: <span className="text-gray-800">{invoiceData.customerId}</span></div>
                                <div className="text-sm font-semibold text-gray-500 tracking-wide mb-1">DATE: <span className="text-gray-800">{new Date(invoiceData.date).toLocaleDateString('en-GB')}</span></div>
                                <div className="text-sm font-semibold text-gray-500 tracking-wide">CLIENT: <span className="text-gray-800 uppercase">{invoiceData.clientName}</span></div>
                            </div>
                        </div>

                        {/* Items Table Header */}
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-2xl rounded-b-lg p-3 px-6 flex text-white font-bold text-sm shadow-md mb-4">
                            <div className="flex-grow">ITEM DESCRIPTION</div>
                            <div className="w-24 text-center">QTY</div>
                            <div className="w-32 text-right">PRICE</div>
                            <div className="w-32 text-right">TOTAL</div>
                        </div>

                        {/* Items Body - UPDATED STRUCTURE FOR FLEXIBILITY */}
                        <div className="bg-orange-50 bg-opacity-30 rounded-3xl p-6 min-h-[300px] mb-6 border border-orange-100 flex flex-col">
                             <div className="flex-grow">
                                {invoiceData.items.map((item, idx) => (
                                    <div key={idx} className="flex text-gray-700 text-sm py-3 border-b border-orange-100 last:border-0">
                                        <div className="flex-grow font-medium">{item.description}</div>
                                        <div className="w-24 text-center">{item.qty}</div>
                                        <div className="w-32 text-right">{formatCurrency(item.price)}</div>
                                        <div className="w-32 text-right font-semibold">{formatCurrency(item.qty * item.price)}</div>
                                    </div>
                                ))}
                             </div>
                             
                             {/* Separator Line */}
                             <div className="border-t-2 border-orange-200 mt-8 mb-4"></div>

                             {/* Totals Section - RELATIVE POSITIONING FIXED */}
                             <div className="ml-auto w-64">
                                <div className="flex justify-between py-1 text-gray-600 font-semibold">
                                    <span>SUB TOTAL</span>
                                    <span>{formatCurrency(calculateSubTotal())}</span>
                                </div>
                                <div className="flex justify-between py-1 text-gray-600 font-semibold">
                                    <span>GST ({invoiceData.taxRate}%)</span>
                                    <span>{formatCurrency(calculateTax())}</span>
                                </div>
                                <div className="flex justify-between py-2 text-gray-800 font-bold text-lg mt-2 border-t border-orange-200">
                                    <span>GRAND TOTAL</span>
                                    <span>{formatCurrency(calculateGrandTotal())}</span>
                                </div>
                             </div>
                        </div>

                        {/* Footer Info Cards */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                             {/* Payment Info */}
                             <div className="bg-red-50 rounded-2xl p-6">
                                <h3 className="text-teal-700 font-bold mb-3">Payable To</h3>
                                <p className="text-gray-700 font-medium mb-1">{invoiceData.bankName}</p>
                                <p className="text-gray-500 text-sm whitespace-pre-line mb-3">{invoiceData.companyAddress}</p>
                                
                                <h4 className="text-teal-700 font-bold text-sm mb-1">Bank Details</h4>
                                <div className="text-sm text-gray-600">
                                    <p><span className="font-semibold text-gray-700">Name:</span> {invoiceData.bankName}</p>
                                    <p><span className="font-semibold text-gray-700">A/C No:</span> {invoiceData.bankAccount}</p>
                                    <p><span className="font-semibold text-gray-700">IFSC:</span> {invoiceData.bankIfsc}</p>
                                </div>
                             </div>

                             {/* Terms */}
                             <div className="bg-red-50 rounded-2xl p-6">
                                <h3 className="text-teal-700 font-bold mb-3">Terms and conditions:</h3>
                                <ul className="text-sm text-gray-600 list-disc list-outside ml-4 space-y-1">
                                    {invoiceData.terms.map((term, i) => (
                                        <li key={i}>{term}</li>
                                    ))}
                                </ul>
                             </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl py-3 px-6 flex justify-between items-center text-sm text-gray-600 font-medium">
                        <div>{invoiceData.companyPhone}</div>
                        <div>{invoiceData.companyEmail}</div>
                        <div>{invoiceData.companyWebsite}</div>
                    </div>
                </div>
                {/* INVOICE CONTENT END */}

            </div>
        </div>

      </div>
      
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        @media print {
           body * {
             visibility: hidden;
           }
           #invoice-preview, #invoice-preview * {
             visibility: visible;
           }
           #invoice-preview {
             position: absolute;
             left: 0;
             top: 0;
           }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;