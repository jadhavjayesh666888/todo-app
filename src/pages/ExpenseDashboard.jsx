import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { 
  Plus, Trash2, Pencil, Wallet, TrendingUp, 
  Calendar, ChevronLeft, ChevronRight, 
  ArrowUpRight, ArrowDownRight, Tag, Info, Settings
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { createPortal } from 'react-dom';
import ExpenseModal from '../components/ExpenseModal';
import ExpenseCategoryModal from '../components/ExpenseCategoryModal';

const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Housing', color: '#6366f1', subCategories: ['Rent', 'Maintenance', 'Utilities'] },
  { id: 'cat_2', name: 'Food', color: '#10b981', subCategories: ['Groceries', 'Dining Out', 'Delivery'] },
  { id: 'cat_3', name: 'Transport', color: '#f59e0b', subCategories: ['Fuel', 'Public Transport', 'Service'] },
  { id: 'cat_4', name: 'Entertainment', color: '#ef4444', subCategories: ['Movies', 'Gaming', 'Events'] },
  { id: 'cat_5', name: 'Health', color: '#ec4899', subCategories: ['Medicines', 'Doctor', 'Gym'] },
  { id: 'cat_6', name: 'Shopping', color: '#06b6d4', subCategories: ['Clothing', 'Electronics', 'Gifts'] }
];

const CustomDatePicker = ({ viewMode, currentDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDateDisplay = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    if (viewMode === 'month') return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return currentDate.getFullYear().toString();
  };

  const adjustDate = (amount) => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() + amount);
    else if (viewMode === 'month') next.setMonth(next.getMonth() + amount);
    else next.setFullYear(next.getFullYear() + amount);
    onChange(next);
  };

  return (
    <div ref={pickerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button 
        onClick={() => adjustDate(-1)}
        className="icon-btn-small" 
        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.5rem' }}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="glass" style={{ 
        display: 'flex', alignItems: 'center', gap: '0.75rem', 
        padding: '0.6rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)',
        minWidth: '160px', justifyContent: 'center', cursor: 'pointer'
      }} onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} color="var(--accent-primary)" />
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatDateDisplay()}</span>
      </div>

      <button 
        onClick={() => adjustDate(1)}
        className="icon-btn-small" 
        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.5rem' }}
      >
        <ChevronRight size={18} />
      </button>

      {isOpen && (
        <div className="glass animate-pop" style={{ 
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: '0.75rem', zIndex: 1000, padding: '1rem', minWidth: '240px',
          backgroundColor: 'var(--surface-card)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          borderRadius: '1.25rem', border: '1px solid var(--border-color)'
        }}>
          {viewMode === 'year' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {Array.from({length: 12}, (_, i) => new Date().getFullYear() - 6 + i).map(y => (
                <button
                  key={y}
                  onClick={() => { onChange(new Date(y, 0, 1)); setIsOpen(false); }}
                  style={{
                    padding: '0.5rem', borderRadius: '8px', border: 'none',
                    background: currentDate.getFullYear() === y ? 'var(--accent-primary)' : 'transparent',
                    color: currentDate.getFullYear() === y ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : viewMode === 'month' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {Array.from({length: 12}, (_, i) => i).map(m => (
                <button
                  key={m}
                  onClick={() => { 
                    const next = new Date(currentDate);
                    next.setMonth(m);
                    onChange(next); 
                    setIsOpen(false); 
                  }}
                  style={{
                    padding: '0.5rem', borderRadius: '8px', border: 'none',
                    background: currentDate.getMonth() === m ? 'var(--accent-primary)' : 'transparent',
                    color: currentDate.getMonth() === m ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                  }}
                >
                  {new Date(0, m).toLocaleString('default', { month: 'short' })}
                </button>
              ))}
            </div>
          ) : (
            <input 
              type="date" 
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => { onChange(new Date(e.target.value)); setIsOpen(false); }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', outline: 'none' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default function ExpenseDashboard() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'month', 'year'
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // Global Event Listener for Navbar Add button
  useEffect(() => {
    const handleOpenExpense = () => {
      setEditingExpense(null);
      setIsExpenseModalOpen(true);
    };
    window.addEventListener('open-add-expense', handleOpenExpense);
    return () => window.removeEventListener('open-add-expense', handleOpenExpense);
  }, []);

  // Sync with Firestore
  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setExpenses(data.expenses || []);
        
        // Auto-initialize categories if empty
        if (!data.expenseCategories || data.expenseCategories.length === 0) {
          await updateDoc(userRef, { expenseCategories: DEFAULT_CATEGORIES });
        } else {
          setCategories(data.expenseCategories);
        }
      } else {
        // Handle case where user document doesn't exist yet
        await updateDoc(userRef, { expenseCategories: DEFAULT_CATEGORIES, expenses: [] });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // DERIVED DATA
  const filteredData = useMemo(() => {
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Sort expenses by date descending, then by creation time descending (newest at top)
    const sorted = [...expenses].sort((a, b) => {
      if (b.date !== a.date) return (b.date || 0) - (a.date || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    
    // Filter based on viewMode
    const periodData = sorted.filter(e => {
      const d = new Date(e.date);
      if (viewMode === 'day') {
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      } else if (viewMode === 'month') {
        return d.getMonth() === month && d.getFullYear() === year;
      } else {
        return d.getFullYear() === year;
      }
    });

    // Aggregates
    const periodTotal = periodData.reduce((sum, e) => sum + Number(e.amount), 0);
    const yearTotal = sorted.filter(e => new Date(e.date).getFullYear() === year).reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Category Breakdown
    const catMap = {};
    periodData.forEach(e => {
      catMap[e.categoryId] = (catMap[e.categoryId] || 0) + Number(e.amount);
    });

    const chartData = Object.keys(catMap).map(id => {
      const cat = categories.find(c => c.id === id);
      return {
        name: cat ? cat.name : 'Other',
        value: catMap[id],
        color: cat ? cat.color : '#94a3b8'
      };
    }).sort((a, b) => b.value - a.value);

    // Insights
    const topCatId = Object.keys(catMap).reduce((a, b) => catMap[a] > catMap[b] ? a : b, null);
    const topCategory = categories.find(c => c.id === topCatId);
    
    // MoM Comparison (Relevant for month view)
    let momChange = 0;
    if (viewMode === 'month') {
      const prevMonthDate = new Date(year, month - 1, 1);
      const prevMonthTotal = sorted.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === prevMonthDate.getMonth() && ed.getFullYear() === prevMonthDate.getFullYear();
      }).reduce((sum, e) => sum + Number(e.amount), 0);

      if (prevMonthTotal > 0) {
        momChange = ((periodTotal - prevMonthTotal) / prevMonthTotal) * 100;
      }
    }

    // Trend Data
    const trend = [];
    if (viewMode === 'year') {
      // Show months of the year
      for (let i = 0; i < 12; i++) {
        const total = sorted.filter(e => {
          const ed = new Date(e.date);
          return ed.getMonth() === i && ed.getFullYear() === year;
        }).reduce((sum, e) => sum + Number(e.amount), 0);
        trend.push({ name: new Date(year, i).toLocaleString('default', { month: 'short' }), amount: total });
      }
    } else {
      // Show last 6 units (days or months)
      for (let i = 5; i >= 0; i--) {
        const d = viewMode === 'day' ? new Date(year, month, day - i) : new Date(year, month - i, 1);
        const total = sorted.filter(e => {
          const ed = new Date(e.date);
          if (viewMode === 'day') return ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
        }).reduce((sum, e) => sum + Number(e.amount), 0);
        
        trend.push({
          name: viewMode === 'day' ? d.getDate().toString() : d.toLocaleString('default', { month: 'short' }),
          amount: total
        });
      }
    }

    return { 
      periodData, yearTotal, periodTotal,
      chartData, topCategory, trend, 
      momChange, transactionCount: periodData.length 
    };
  }, [expenses, categories, currentDate, viewMode]);

  // ACTIONS
  const handleSaveExpense = async (data) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const existing = snap.exists() ? (snap.data().expenses || []) : [];
      let updated;
      
      if (data.id) {
        updated = existing.map(e => e.id === data.id ? { ...e, ...data } : e);
      } else {
        updated = [...existing, { ...data, id: Date.now().toString(), createdAt: Date.now() }];
      }
      
      await updateDoc(userRef, { expenses: updated });
      setIsExpenseModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const deleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updated = expenses.filter(e => e.id !== expenseToDelete.id);
      await updateDoc(userRef, { expenses: updated });
      setExpenseToDelete(null);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Expense Tracker</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            {/* View Mode Selector */}
            <div className="glass" style={{ display: 'inline-flex', padding: '0.25rem', borderRadius: '12px', width: 'fit-content' }}>
              {['day', 'month', 'year'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewMode === mode ? 'var(--accent-primary)' : 'transparent',
                    color: viewMode === mode ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.23s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Granular Date Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CustomDatePicker 
                viewMode={viewMode}
                currentDate={currentDate}
                onChange={setCurrentDate}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsCategoryModalOpen(true)} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
            <Settings size={18} /> Manage Categories
          </button>
          <button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem', borderRadius: '14px' }}>
            <Plus size={20} /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass card-p" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>
            {viewMode.toUpperCase()} TOTAL
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem' }}>₹{filteredData.periodTotal.toLocaleString()}</div>
        </div>
        <div className="glass card-p" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>YEAR TOTAL</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem' }}>₹{filteredData.yearTotal.toLocaleString()}</div>
        </div>
        <div className="glass card-p" style={{ borderLeft: `4px solid ${filteredData.topCategory?.color || '#94a3b8'}` }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Top Category</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {filteredData.topCategory ? filteredData.topCategory.name : 'N/A'}
          </div>
        </div>
        <div className="glass card-p" style={{ borderLeft: `4px solid ${filteredData.momChange >= 0 ? '#ef4444' : '#10b981'}` }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>INSIGHT</div>
          {viewMode === 'month' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
              {filteredData.momChange >= 0 ? <ArrowUpRight size={20} color="#ef4444" /> : <ArrowDownRight size={20} color="#10b981" />}
              <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{Math.abs(Math.round(filteredData.momChange))}%</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>vs last month</span>
            </div>
          ) : (
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem', opacity: 0.7 }}>
              {viewMode === 'day' ? 'Daily Report' : 'Annual Report'}
            </div>
          )}
        </div>
      </div>

      {/* Micro Insights */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Info size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.9rem' }}>
            Average / {viewMode === 'year' ? 'Month' : 'Day'}: 
            <strong> ₹{Math.round(filteredData.periodTotal / (viewMode === 'year' ? 12 : (viewMode === 'month' ? 30 : 1))).toLocaleString()}</strong>
          </span>
        </div>
        <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={16} color="#10b981" />
          <span style={{ fontSize: '0.9rem' }}>Transactions: <strong>{filteredData.transactionCount}</strong></span>
        </div>
        <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Wallet size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.9rem' }}>Largest: <strong>₹{Math.max(0, ...filteredData.periodData.map(e => e.amount)).toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass" style={{ padding: '2rem', minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Category Breakdown</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData.chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {filteredData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            {filteredData.chartData.map((cat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>6-Month Trend</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData.trend}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Transactions</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {filteredData.transactionCount} items this {viewMode}
          </div>
        </div>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {filteredData.periodData.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
              No expenses recorded for this {viewMode}.
            </div>
          ) : (
            filteredData.periodData.map(exp => {
              const cat = categories.find(c => c.id === exp.categoryId);
              return (
                <div key={exp.id} className="expense-row" style={{ 
                  display: 'flex', alignItems: 'center', padding: '1.25rem 1.5rem', 
                  borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s'
                }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    backgroundColor: `${cat?.color || '#94a3b8'}20`, color: cat?.color || '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem'
                  }}>
                    <Wallet size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{exp.description}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {cat?.name || 'Uncategorized'} {exp.subCategory ? `• ${exp.subCategory}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '1.5rem' }}>
                    <div style={{ fontWeight: 900 }}>₹{Number(exp.amount).toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {new Date(exp.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setEditingExpense(exp); setIsExpenseModalOpen(true); }} className="icon-btn"><Pencil size={14} /></button>
                    <button onClick={() => setExpenseToDelete(exp)} className="icon-btn danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSave={handleSaveExpense}
        categories={categories}
        initialData={editingExpense}
      />
      <ExpenseCategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSave={async (newCats) => {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, { expenseCategories: newCats });
        }}
      />

      {/* Delete Confirmation */}
      {expenseToDelete && createPortal(
        <div className="modal-overlay">
          <div className="glass modal-content animate-pop">
            <h3>Delete Transaction?</h3>
            <p>This will permanently remove this expense record.</p>
            <div className="modal-actions">
              <button onClick={() => setExpenseToDelete(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={deleteExpense} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>, document.body
      )}

      <style>{`
        .card-p { padding: 1.5rem; }
        .icon-btn-small { padding: 0.3rem; background: transparent; border: none; cursor: pointer; color: var(--text-secondary); }
        .icon-btn-small:hover { color: var(--accent-primary); }
        .expense-row:hover { background: rgba(255,255,255,0.02); }
        .icon-btn { padding: 0.5rem; background: rgba(255,255,255,0.03); border: none; border-radius: 8px; cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
        .icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--accent-primary); }
        .icon-btn.danger:hover { color: var(--accent-danger); }
        .glass-btn { display: flex; alignItems: center; gap: 0.6rem; padding: 0.75rem 1.25rem; border-radius: 14px; border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 700; cursor: pointer; background: rgba(255,255,255,0.02); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .modal-content { padding: 2.5rem; border-radius: 2rem; text-align: center; max-width: 400px; }
        .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
      `}</style>
    </div>
  );
}
