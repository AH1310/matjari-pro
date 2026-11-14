import { useEffect, useState, type FormEvent } from 'react'
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { auth, firebaseApp } from './firebase'

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!auth)
  const [accessState, setAccessState] = useState<'checking' | 'admin' | 'pending' | 'error'>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, currentUser => {
      setAccessState('checking')
      setUser(currentUser)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const app = firebaseApp
    if (!app) { setAccessState('error'); return }
    setAccessState('checking')
    let cancelled = false
    import('firebase/firestore').then(({ doc, getDoc, getFirestore }) =>
      getDoc(doc(getFirestore(app), 'admins', user.uid))
    ).then(snapshot => {
      if (cancelled) return
      const profile = snapshot.data()
      setAccessState(snapshot.exists() && profile?.role === 'super_admin' && profile?.active === true ? 'admin' : 'pending')
    }).catch(() => { if (!cancelled) setAccessState('error') })
    return () => { cancelled = true }
  }, [user])

  if (!authReady) return <main className="loading-screen">جاري التحقق من الحساب…</main>
  if (user && accessState === 'checking') return <main className="loading-screen">جاري التحقق من صلاحية مدير المنصة…</main>
  if (user && accessState === 'admin') return <Dashboard email={user.email ?? ''} onLogout={() => auth && signOut(auth)} />
  if (user) return <main className="access-state" dir="rtl"><section><span className="access-mark">م</span><h1>{accessState === 'error' ? 'تعذر التحقق من الصلاحية' : 'الحساب يحتاج تفعيل صلاحية المدير'}</h1><p>{accessState === 'error' ? 'تأكد من نشر قواعد Firestore الجديدة ثم أعد المحاولة.' : 'تم تسجيل الدخول، لكن سجل مدير المنصة لم يُنشأ لهذا الحساب بعد.'}</p><small>{user.email}</small><button onClick={() => auth && signOut(auth)}>تسجيل الخروج</button></section></main>

  async function signIn(event: FormEvent) {
    event.preventDefault()
    if (!auth) return setNotice('إعداد Firebase غير مكتمل بعد.')
    setBusy(true); setNotice('')
    try { await signInWithEmailAndPassword(auth, email.trim(), password) }
    catch { setNotice('تعذّر تسجيل الدخول. راجع البريد وكلمة المرور وحاول مرة أخرى.') }
    finally { setBusy(false) }
  }

  async function resetPassword() {
    if (!auth) return setNotice('إعداد Firebase غير مكتمل بعد.')
    if (!email.trim()) return setNotice('اكتب بريدك الإلكتروني أولًا.')
    setBusy(true); setNotice('')
    try { await sendPasswordResetEmail(auth, email.trim()); setNotice('لو البريد مسجل، هيوصلك رابط إعادة تعيين كلمة المرور.') }
    catch { setNotice('تعذّر إرسال الرابط. راجع البريد وحاول مرة أخرى.') }
    finally { setBusy(false) }
  }

  return <main className="page">
    <section className="intro"><div className="brand-mark">م</div><p className="eyebrow">إدارة أذكى لمتجرك</p><h1>متجري <span>برو</span></h1><p className="sub">نقطة بيع ومخزون وفواتير، في مكان واحد.</p><div className="decor" aria-hidden="true">✳</div></section>
    <section className="login-card"><p className="eyebrow">أهلًا بعودتك</p><h2>تسجيل الدخول</h2><p className="hint">استخدم بيانات الحساب التي أنشأها مدير المنصة.</p>
      <form onSubmit={signIn}>
        <label htmlFor="email">البريد الإلكتروني</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" />
        <label htmlFor="password">كلمة المرور</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
        <button className="submit" disabled={busy}>{busy ? 'لحظة من فضلك…' : 'دخول إلى حسابك'} <span>←</span></button>
      </form>
      <button className="reset" disabled={busy} onClick={resetPassword}>نسيت كلمة المرور؟</button>
      {notice && <p className="notice" role="status">{notice}</p>}
      <p className="foot">إنشاء الحسابات متاح لمدير المنصة فقط.</p>
    </section>
    <footer>متجري برو <span>·</span> إدارة متجرك ببساطة</footer>
  </main>
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [active, setActive] = useState('الرئيسية')
  const menu = [
    ['الرئيسية', '⌂'], ['نقطة البيع', '▣'], ['الفواتير', '▤'], ['المنتجات', '◈'],
    ['التصنيفات', '▦'], ['الوحدات', '⚖'], ['المخزون', '▣'], ['المشتريات', '▱'],
    ['الموردون', '♧'], ['العملاء', '♙'], ['التقارير', '▥'], ['الإعدادات', '⚙'],
  ]
  return <main className="app-layout" dir="rtl">
    <aside className="app-sidebar">
      <div className="app-brand"><span className="app-brand-mark">م</span><span>متجري <b>برو</b><small>نظام إدارة المتجر</small></span></div>
      <div className="store-chip"><span className="store-avatar">م</span><span>متجري الأول<small>حساب تجريبي</small></span><span className="chevron">⌄</span></div>
      <nav className="side-nav" aria-label="القائمة الرئيسية">{menu.map(([label, icon]) => <button key={label} className={active === label ? 'nav-item selected' : 'nav-item'} onClick={() => setActive(label)}><span className="nav-icon">{icon}</span>{label}{label === 'نقطة البيع' && <span className="nav-arrow">←</span>}</button>)}</nav>
      <button className="logout-button" onClick={onLogout}><span className="nav-icon">⇥</span>تسجيل الخروج</button>
    </aside>
    <section className="app-main">
      {active === 'نقطة البيع' ? <POSScreen /> : <>
      <header className="topbar"><div><p className="top-eyebrow">إدارة المنصة</p><strong>{active}</strong></div><div className="top-actions"><button className="icon-button" aria-label="الإشعارات">♧</button><div className="user-pill"><span className="user-avatar">{email.slice(0,1).toUpperCase() || 'م'}</span><span><b>{email || 'مدير المنصة'}</b><small>مدير المنصة</small></span></div></div></header>
      <div className="dashboard-content">
        <div className="welcome-row"><div><p className="today-label">لوحة التحكم</p><h1>أهلًا بك في متجري برو</h1><p>نظرة سريعة على نشاط متجرك اليوم.</p></div><button className="date-button">▦　اليوم　⌄</button></div>
        <div className="setup-note"><span className="note-icon">i</span><div><b>تم تسجيل الدخول بنجاح</b><p>دي لوحة البداية. هنفعّل بيانات المتجر والصلاحيات بعد إعداد قاعدة البيانات، لذلك الأرقام هنا توضيحية حاليًا.</p></div></div>
        <div className="stats-grid"><Stat title="مبيعات اليوم" value="—" note="تظهر بعد إعداد قاعدة البيانات" icon="↗" tone="blue"/><Stat title="الفواتير" value="—" note="لا توجد بيانات موصولة بعد" icon="▤" tone="green"/><Stat title="المنتجات" value="—" note="لا توجد بيانات موصولة بعد" icon="◈" tone="orange"/><Stat title="المخزون المنخفض" value="—" note="لا توجد بيانات موصولة بعد" icon="▣" tone="purple"/></div>
        <div className="dashboard-panels"><section className="panel sales-panel"><div className="panel-heading"><div><h2>ملخص المبيعات</h2><p>متابعة مبيعات المتجر</p></div><button className="period-button">آخر 7 أيام　⌄</button></div><div className="empty-chart"><div className="chart-lines"><i/><i/><i/><i/></div><span>سيظهر الرسم البياني بعد ربط بيانات المبيعات</span></div></section><section className="panel quick-panel"><div className="panel-heading"><div><h2>إجراءات سريعة</h2><p>اختصارات للمهام اليومية</p></div></div><button className="quick-action" onClick={() => setActive('نقطة البيع')}><span className="quick-icon blue-icon">＋</span><span><b>بدء عملية بيع</b><small>افتح شاشة نقطة البيع</small></span><span className="quick-arrow">←</span></button><button className="quick-action" onClick={() => setActive('المنتجات')}><span className="quick-icon green-icon">◈</span><span><b>إدارة المنتجات</b><small>أضف المنتجات والأسعار</small></span><span className="quick-arrow">←</span></button></section></div>
        <footer className="dashboard-footer">متجري برو <span>•</span> إدارة متجرك ببساطة</footer>
      </div>
      </>}
    </section>
  </main>
}

function Stat({ title, value, note, icon, tone }: { title: string; value: string; note: string; icon: string; tone: string }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><p>{title}</p><strong>{value}</strong><small>{note}</small></article>
}

type Product = { id: number; name: string; category: string; price: number; unit: string; icon: string; barcode: string }
type CartItem = Product & { qty: number }
const catalog: Product[] = [
  { id: 1, name: 'حليب كامل الدسم', category: 'ألبان', price: 8.5, unit: 'عبوة', icon: '🥛', barcode: '628100100001' },
  { id: 2, name: 'خبز طازج', category: 'مخبوزات', price: 3, unit: 'قطعة', icon: '🥖', barcode: '628100100002' },
  { id: 3, name: 'أرز بسمتي', category: 'مواد غذائية', price: 24, unit: 'كيس', icon: '🍚', barcode: '628100100003' },
  { id: 4, name: 'زيت نباتي', category: 'مواد غذائية', price: 16.75, unit: 'عبوة', icon: '🫒', barcode: '628100100004' },
  { id: 5, name: 'جبنة بيضاء', category: 'ألبان', price: 12.5, unit: 'علبة', icon: '🧀', barcode: '628100100005' },
  { id: 6, name: 'عصير برتقال', category: 'مشروبات', price: 6, unit: 'عبوة', icon: '🧃', barcode: '628100100006' },
  { id: 7, name: 'مياه معدنية', category: 'مشروبات', price: 1.5, unit: 'قارورة', icon: '💧', barcode: '628100100007' },
  { id: 8, name: 'بيض طازج', category: 'ألبان', price: 18, unit: 'طبق', icon: '🥚', barcode: '628100100008' },
  { id: 9, name: 'سكر أبيض', category: 'مواد غذائية', price: 7.25, unit: 'كيس', icon: '🍚', barcode: '628100100009' },
  { id: 10, name: 'قهوة عربية', category: 'مشروبات', price: 32, unit: 'عبوة', icon: '☕', barcode: '628100100010' },
  { id: 11, name: 'شوكولاتة', category: 'حلويات', price: 5, unit: 'قطعة', icon: '🍫', barcode: '628100100011' },
  { id: 12, name: 'مكرونة', category: 'مواد غذائية', price: 4.5, unit: 'كيس', icon: '🍝', barcode: '628100100012' },
]
const money = (amount: number) => `${amount.toFixed(2)} EGP`

function POSScreen() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('الكل')
  const [payment, setPayment] = useState('نقدي')
  const [paid, setPaid] = useState('')
  const [discount, setDiscount] = useState('0')
  const [customer, setCustomer] = useState('عميل نقدي')
  const [toast, setToast] = useState('')
  const [held, setHeld] = useState<CartItem[] | null>(null)
  const [barcode, setBarcode] = useState('')
  const categories = ['الكل', 'ألبان', 'مواد غذائية', 'مشروبات', 'مخبوزات', 'حلويات']
  const matches = catalog.filter(p => (category === 'الكل' || p.category === category) && `${p.name} ${p.barcode}`.includes(search.trim()))
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0))
  const taxable = subtotal - discountAmount
  const tax = taxable * 0.14
  const total = taxable + tax
  const change = Math.max(0, (Number(paid) || 0) - total)
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const addProduct = (product: Product) => setCart(current => {
    const existing = current.find(item => item.id === product.id)
    return existing ? current.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...current, { ...product, qty: 1 }]
  })
  const updateQty = (id: number, delta: number) => setCart(current => current.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0))
  const scanBarcode = (event: FormEvent) => { event.preventDefault(); const product = catalog.find(item => item.barcode === barcode.trim()); if (product) { addProduct(product); setBarcode(''); flash(`تمت إضافة ${product.name}`) } else flash('الباركود غير موجود في المنتجات التجريبية') }
  const holdInvoice = () => { if (!cart.length) return flash('أضف منتجًا إلى الفاتورة أولًا'); setHeld(cart); setCart([]); flash('تم تعليق الفاتورة لهذه الجلسة') }
  const resumeInvoice = () => { if (held) { setCart(held); setHeld(null); flash('تم استرجاع الفاتورة المعلقة') } else flash('لا توجد فاتورة معلقة') }
  const finishSale = () => { if (!cart.length) return flash('الفاتورة فارغة'); if ((Number(paid) || 0) < total) return flash('المبلغ المستلم أقل من الإجمالي'); flash('تم إتمام البيع تجريبيًا؛ لم يُحفظ في قاعدة البيانات'); setCart([]); setPaid(''); setDiscount('0') }
  return <div className="pos-page" dir="rtl">
    <header className="pos-toolbar"><div className="pos-title"><span className="pos-store-icon">م</span><div><b>نقطة البيع</b><small>المتجر الرئيسي　⌄</small></div></div><form className="barcode-search" onSubmit={scanBarcode}><input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="امسح الباركود أو أدخل رقمه" aria-label="الباركود"/><button title="بحث بالباركود">▥</button></form><div className="pos-date">▦ <span>اليوم</span></div><button className="pos-user" title="المستخدم">♙</button></header>
    <div className="pos-actionbar"><button className="toggle-products" onClick={()=>flash('قائمة المنتجات السريعة ظاهرة')}>◉　إظهار المنتجات السريعة</button><button className="sale-mode active-mode">🛒　بيع عادي</button><button onClick={()=>flash('ميزة الاستلام ستتصل بالمشتريات لاحقًا')}>▣　استلام</button><button onClick={()=>flash('ميزة التوصيل ستضاف مع بيانات العملاء')}>🚚　توصيل</button><button onClick={()=>flash('التقسيط يحتاج إعداد وسيلة الدفع')}>▦　تقسيط الفاتورة</button><label className="customer-select">♙　<select value={customer} onChange={e=>setCustomer(e.target.value)}><option>عميل نقدي</option><option>عميل مسجل تجريبي</option></select></label></div>
    <div className="pos-workspace">
      <section className="quick-products"><div className="quick-products-head"><b>المنتجات السريعة</b><span>⌗</span></div><input className="product-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن منتج أو باركود..."/><div className="category-pills">{categories.map(c=><button key={c} className={category===c?'chosen':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="product-grid">{matches.map(product=><button key={product.id} className="product-tile" onClick={()=>addProduct(product)}><span className="product-emoji">{product.icon}</span><b>{product.name}</b><small>{money(product.price)} / {product.unit}</small></button>)}</div><button className="product-manage" onClick={()=>flash('إدارة المنتجات قيد التجهيز')}>إدارة المنتجات <span>⚙</span></button></section>
      <section className="invoice-section"><div className="invoice-head"><b>الفاتورة الحالية</b><div className="invoice-tools"><button onClick={()=>flash('قائمة الفواتير المحفوظة غير متاحة قبل ربط قاعدة البيانات')}>قائمة الفواتير　⌄</button><button onClick={()=>{setCart([]);setPaid('');flash('تم تفريغ السلة')}}>حذف الكل　×</button></div></div><div className="invoice-table-wrap"><table className="invoice-table"><thead><tr><th>#</th><th>المنتج</th><th>الوحدة</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th></th></tr></thead><tbody>{cart.map((item,index)=><tr key={item.id}><td>{index+1}</td><td className="invoice-product">{item.name}</td><td>{item.unit}</td><td><span className="qty-control"><button onClick={()=>updateQty(item.id,-1)}>−</button><b>{item.qty}</b><button onClick={()=>updateQty(item.id,1)}>+</button></span></td><td>{money(item.price)}</td><td className="line-total">{money(item.price*item.qty)}</td><td><button className="remove-item" onClick={()=>updateQty(item.id,-item.qty)} title="حذف">×</button></td></tr>)}{!cart.length&&<tr><td colSpan={7} className="empty-cart"><span>🧺</span><b>الفاتورة فارغة</b><small>اختر منتجًا من القائمة لإضافته</small></td></tr>}</tbody></table></div><div className="invoice-bottom"><button onClick={holdInvoice}>Ⅱ　تعليق الفاتورة</button><button onClick={resumeInvoice}>↻　استرجاع {held?'(1)':''}</button><form onSubmit={scanBarcode}><input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="مسح الباركود"/><button>▥</button></form><button onClick={()=>flash('إضافة منتج جديد ستتوفر في إدارة المنتجات')}>＋　إضافة منتج</button></div></section>
      <aside className="invoice-summary"><div className="summary-title"><b>ملخص الفاتورة</b><span>▤</span></div><div className="summary-count">عدد الأصناف <b>{cart.reduce((n,i)=>n+i.qty,0)}</b></div><div className="summary-row"><span>الإجمالي قبل الخصم</span><b>{money(subtotal)}</b></div><div className="summary-row discount-row"><label htmlFor="discount">الخصم</label><span><input id="discount" type="number" min="0" max={subtotal} value={discount} onChange={e=>setDiscount(e.target.value)}/> EGP</span></div><div className="summary-row"><span>الضريبة (14%)</span><b>{money(tax)}</b></div><div className="summary-total"><span>الإجمالي الكلي</span><b>{money(total)}</b></div><div className="payment-title">طريقة الدفع</div><div className="payment-options">{['نقدي','بطاقة','محفظة'].map(method=><button key={method} onClick={()=>setPayment(method)} className={payment===method?'payment-selected':''}><i>{payment===method?'●':'○'}</i>{method}</button>)}</div><label className="paid-label">المبلغ المستلم<input type="number" min="0" value={paid} onChange={e=>setPaid(e.target.value)} placeholder="0.00"/></label><div className="change-row"><span>الباقي</span><b>{money(change)}</b></div><div className="summary-shortcuts"><button onClick={()=>setCustomer('عميل مسجل تجريبي')}>♙　اختيار عميل</button><button onClick={()=>flash('عرض تفاصيل الدفع التجريبي')}>▣　تفاصيل الدفع</button></div><button className="complete-sale" onClick={finishSale}>▣　تأكيد البيع　✓</button><div className="bottom-actions"><button onClick={holdInvoice}>◷　معلق (F8)</button><button onClick={resumeInvoice}>↶　استرجاع (F9)</button><button className="cancel-sale" onClick={()=>{setCart([]);setPaid('');flash('تم إلغاء الفاتورة الحالية')}}>×　إلغاء (Esc)</button><button className="touch-mode" onClick={()=>flash('واجهة اللمس مفعّلة')}>▦　وضع اللمس</button></div></aside>
    </div>{toast&&<div className="pos-toast" role="status">{toast}</div>}
  </div>
}
