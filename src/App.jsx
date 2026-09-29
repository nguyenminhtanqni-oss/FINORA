import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const categories = [
  "Ăn uống", "Mua sắm", "Di chuyển", "Giải trí", 
  "Hóa đơn", "Sức khỏe", "Lương", "Thưởng", 
  "Chuyển tiền", "Dịch vụ", "Nâng cấp VIP", "Khác"
];

const BANKS = [
  { code: "MB", name: "MB Bank" },
  { code: "VCB", name: "Vietcombank" },
  { code: "BIDV", name: "BIDV" },
  { code: "CTG", name: "VietinBank" },
  { code: "TCB", name: "Techcombank" },
];

const SERVICES_LIST = [
  { id: "phone", name: "Nạp tiền điện thoại", icon: "📱", defaultAmount: 50000 },
  { id: "elec", name: "Thanh toán Tiền điện", icon: "🧾", defaultAmount: 450000 },
  { id: "water", name: "Thanh toán Tiền nước", icon: "💧", defaultAmount: 120000 },
  { id: "net", name: "Cước Internet / 4G", icon: "🌐", defaultAmount: 220000 },
  { id: "movie", name: "Mua vé xem phim", icon: "🎬", defaultAmount: 110000 },
  { id: "tuition", name: "Thanh toán Học phí", icon: "🎓", defaultAmount: 1500000 },
];

const MEMBERSHIP_PLANS = [
  { id: "basic", name: "Thành viên Thường", price: 0, limit: 5000000, desc: "Giới hạn giao dịch tối đa 5.000.000 ₫ / lần" },
  { id: "vip", name: "Thành viên VIP ✨", price: 99000, limit: 50000000, desc: "Hạn mức 50.000.000 ₫ / lần, hoàn tiền 1%" },
  { id: "pro", name: "Thành viên Enterprise 💎", price: 299000, limit: 999999999, desc: "Không giới hạn hạn mức giao dịch" },
];

const initialData = {
  users: [
    {
      name: "Nguyễn Minh Tấn",
      email: "tan@gmail.com",
      password: "123",
      walletBalance: 10000000,
      tier: "basic",
      themeMode: "light",
      primaryColor: "#0d6efd",
      linkedBanks: [
        { id: 101, bankName: "MB Bank", bankCode: "MB", accountNumber: "0000123456", accountName: "NGUYEN MINH TAN", maskedNumber: "•••• 3456", bankBalance: 15000000 }
      ],
    },
  ],
  currentUser: null,
  transactions: [
    { id: 1, userEmail: "tan@gmail.com", type: "expense", title: "Ăn sáng & Cà phê", amount: 45000, category: "Ăn uống", date: "2026-09-09" },
    { id: 2, userEmail: "tan@gmail.com", type: "income", title: "Lương tháng 9", amount: 15000000, category: "Lương", date: "2026-09-01" },
  ],
};

function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("finoraVIPApp");
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [authTab, setAuthTab] = useState("login");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");

  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLinkBankModal, setShowLinkBankModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: "tan@gmail.com", password: "123" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [transferForm, setTransferForm] = useState({ bankId: "", amount: "", action: "deposit" });
  const [linkBankForm, setLinkBankForm] = useState({ bankCode: "MB", accountNumber: "", accountName: "" });
  const [servicePayForm, setServicePayForm] = useState({ accountCode: "", amount: "" });

  useEffect(() => {
    localStorage.setItem("finoraVIPApp", JSON.stringify(data));
  }, [data]);

  const currentUser = data.users.find((u) => u.email === data.currentUser?.email) || data.currentUser;
  const userTransactions = data.transactions.filter((item) => item.userEmail === currentUser?.email);

  const walletBalance = Number(currentUser?.walletBalance || 0);
  const linkedBanks = currentUser?.linkedBanks || [];
  const primaryColor = currentUser?.primaryColor || "#0d6efd";
  const isDarkMode = currentUser?.themeMode === "dark";

  const userTierObj = MEMBERSHIP_PLANS.find((p) => p.id === (currentUser?.tier || "basic"));
  const maxTxLimit = userTierObj ? userTierObj.limit : 5000000;

  const formatMoney = (money) => Number(money || 0).toLocaleString("vi-VN") + " ₫";

  // Thống kê thu chi theo tháng
  const monthlyTransactions = userTransactions.filter((t) => t.date.startsWith(selectedMonth));
  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const monthlyExpense = monthlyTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  // AUTH HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    const user = data.users.find((u) => u.email === loginForm.email && u.password === loginForm.password);
    if (user) setData({ ...data, currentUser: user });
    else alert("Email hoặc mật khẩu chưa chính xác!");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) return alert("Vui lòng điền đủ thông tin!");
    if (data.users.some((u) => u.email === registerForm.email)) return alert("Email đã được sử dụng!");

    const newUser = {
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      walletBalance: 0,
      tier: "basic",
      themeMode: "light",
      primaryColor: "#0d6efd",
      linkedBanks: [],
    };

    setData((prev) => ({ ...prev, users: [...prev.users, newUser], currentUser: newUser }));
  };

  const handleLogout = () => setData({ ...data, currentUser: null });

  // NÂNG CẤP THÀNH VIÊN VIP
  const handleUpgradeTier = (plan) => {
    if (currentUser.tier === plan.id) return alert("Bạn đang ở gói thành viên này!");
    if (walletBalance < plan.price) return alert("Số dư ví không đủ để nâng cấp gói này!");

    const updatedUsers = data.users.map((u) => u.email === currentUser.email ? { ...u, walletBalance: walletBalance - plan.price, tier: plan.id } : u);
    
    const newTx = {
      id: Date.now(), userEmail: currentUser.email, type: "expense", title: `Nâng cấp gói ${plan.name}`, amount: plan.price, category: "Nâng cấp VIP", date: new Date().toISOString().split("T")[0]
    };

    setData((prev) => ({ ...prev, users: updatedUsers, transactions: [newTx, ...prev.transactions] }));
    alert(`Chúc mừng! Bạn đã nâng cấp thành công gói: ${plan.name}`);
  };

  // CHUYỂN / RÚT TIỀN (KIỂM TRA HẠN MỨC GIAO DỊCH)
  const handleBankTransfer = (e) => {
    e.preventDefault();
    const amt = Number(transferForm.amount);
    if (!amt || amt <= 0 || !transferForm.bankId) return alert("Số tiền hoặc ngân hàng không hợp lệ!");

    if (amt > maxTxLimit) {
      return alert(`Giao dịch thất bại! Gói hiện tại của bạn chỉ cho phép giao dịch tối đa ${formatMoney(maxTxLimit)}/lần. Hãy nâng cấp gói thành viên!`);
    }

    const bank = linkedBanks.find((b) => b.id === Number(transferForm.bankId));
    if (!bank) return;

    let newWallet = walletBalance;
    let newBankBal = bank.bankBalance;

    if (transferForm.action === "deposit") {
      if (bank.bankBalance < amt) return alert("Số dư tài khoản ngân hàng không đủ!");
      newWallet += amt;
      newBankBal -= amt;
    } else {
      if (walletBalance < amt) return alert("Số dư ví không đủ để rút!");
      newWallet -= amt;
      newBankBal += amt;
    }

    const updatedBanks = linkedBanks.map((b) => b.id === bank.id ? { ...b, bankBalance: newBankBal } : b);
    const updatedUsers = data.users.map((u) => u.email === currentUser.email ? { ...u, walletBalance: newWallet, linkedBanks: updatedBanks } : u);

    const newTx = {
      id: Date.now(),
      userEmail: currentUser.email,
      type: transferForm.action === "deposit" ? "income" : "expense",
      title: transferForm.action === "deposit" ? `Nạp tiền từ ${bank.bankName}` : `Rút tiền về ${bank.bankName}`,
      amount: amt, category: "Chuyển tiền", date: new Date().toISOString().split("T")[0]
    };

    setData((prev) => ({ ...prev, users: updatedUsers, transactions: [newTx, ...prev.transactions] }));
    setShowTransferModal(false);
  };

  // LIÊN KẾT & HỦY LIÊN KẾT NGÂN HÀNG
  const handleLinkBank = (e) => {
    e.preventDefault();
    if (!linkBankForm.accountNumber || !linkBankForm.accountName) return alert("Vui lòng nhập đủ thông tin thẻ!");

    const bankObj = BANKS.find((b) => b.code === linkBankForm.bankCode);
    const newBank = {
      id: Date.now(), bankName: bankObj.name, bankCode: bankObj.code, accountNumber: linkBankForm.accountNumber,
      accountName: linkBankForm.accountName.toUpperCase(), maskedNumber: "•••• " + linkBankForm.accountNumber.slice(-4), bankBalance: 20000000
    };

    const updatedUsers = data.users.map((u) => u.email === currentUser.email ? { ...u, linkedBanks: [...(u.linkedBanks || []), newBank] } : u);
    setData({ ...data, users: updatedUsers });
    setShowLinkBankModal(false);
  };

  const handleUnlinkBank = (bankId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy liên kết thẻ ngân hàng này?")) {
      const updatedBanks = linkedBanks.filter((b) => b.id !== bankId);
      const updatedUsers = data.users.map((u) => u.email === currentUser.email ? { ...u, linkedBanks: updatedBanks } : u);
      setData({ ...data, users: updatedUsers });
    }
  };

  // THANH TOÁN DỊCH VỤ
  const handlePayService = (e) => {
    e.preventDefault();
    const amt = Number(servicePayForm.amount);
    if (!amt || amt <= 0) return alert("Vui lòng nhập số tiền hợp lệ!");
    if (amt > maxTxLimit) return alert(`Giao dịch vượt quá hạn mức ${formatMoney(maxTxLimit)} của gói hiện tại!`);
    if (walletBalance < amt) return alert("Số dư ví không đủ để thanh toán!");

    const updatedUsers = data.users.map((u) => u.email === currentUser.email ? { ...u, walletBalance: walletBalance - amt } : u);
    const newTx = {
      id: Date.now(), userEmail: currentUser.email, type: "expense", title: `${selectedService.name} (${servicePayForm.accountCode || "Trực tiếp"})`, amount: amt, category: "Dịch vụ", date: new Date().toISOString().split("T")[0]
    };

    setData((prev) => ({ ...prev, users: updatedUsers, transactions: [newTx, ...prev.transactions] }));
    alert(`Thanh toán thành công ${formatMoney(amt)}!`);
    setSelectedService(null);
  };

  // CHART DATA
  const lineChartData = {
    labels: monthlyTransactions.map((t) => t.date).reverse(),
    datasets: [
      { label: "Thu nhập", data: monthlyTransactions.map((t) => (t.type === "income" ? t.amount : 0)).reverse(), borderColor: "#198754", backgroundColor: "rgba(25,135,84,0.2)", tension: 0.3 },
      { label: "Chi tiêu", data: monthlyTransactions.map((t) => (t.type === "expense" ? t.amount : 0)).reverse(), borderColor: "#dc3545", backgroundColor: "rgba(220,53,69,0.2)", tension: 0.3 }
    ]
  };

  const doughnutChartData = {
    labels: categories,
    datasets: [{
      data: categories.map((cat) => monthlyTransactions.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + Number(t.amount), 0)),
      backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40", "#20c997", "#0d6efd", "#6c757d", "#198754", "#e83e8c"]
    }]
  };

  const themeStyles = {
    background: isDarkMode ? "#121212" : "#f4f6f9",
    cardBg: isDarkMode ? "#1e1e1e" : "#ffffff",
    text: isDarkMode ? "#e0e0e0" : "#212529",
    subText: isDarkMode ? "#a0a0a0" : "#6c757d",
    border: isDarkMode ? "#2d2d2d" : "#e9ecef"
  };

  if (!data.currentUser) {
    return (
      <div style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", width: "360px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "48px" }}>💎</div>
            <h2 style={{ color: "#0d6efd", margin: "4px 0" }}>Finora Pro</h2>
          </div>
          <div style={{ display: "flex", background: "#f1f3f5", borderRadius: "12px", padding: "4px", marginBottom: "20px" }}>
            <button onClick={() => setAuthTab("login")} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: authTab === "login" ? "#fff" : "transparent", fontWeight: "bold", cursor: "pointer" }}>Đăng nhập</button>
            <button onClick={() => setAuthTab("register")} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: authTab === "register" ? "#fff" : "transparent", fontWeight: "bold", cursor: "pointer" }}>Đăng ký</button>
          </div>
          {authTab === "login" ? (
            <form onSubmit={handleLogin}>
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px" }} placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              <input type="password" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }} placeholder="Mật khẩu" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
              <button style={{ width: "100%", padding: "12px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>Đăng Nhập</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px" }} placeholder="Họ và tên" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px" }} placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
              <input type="password" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }} placeholder="Mật khẩu" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
              <button style={{ width: "100%", padding: "12px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>Tạo Tài Khoản</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: themeStyles.background, color: themeStyles.text }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", background: themeStyles.cardBg, borderRight: `1px solid ${themeStyles.border}`, padding: "24px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: primaryColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>F</div>
            <h3 style={{ margin: 0, color: primaryColor }}>Finora</h3>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              ["dashboard", "📊", "Tổng quan"],
              ["analytics", "📈", "Biểu đồ Phân tích"],
              ["banks", "🏦", "Ngân hàng liên kết"],
              ["services", "⚡", "Dịch vụ & Tiện ích"],
              ["membership", "👑", "Nâng cấp Thành viên"],
              ["settings", "⚙️", "Tùy chỉnh Giao diện"],
            ].map(([key, icon, label]) => (
              <button key={key} onClick={() => setPage(key)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", border: "none", background: page === key ? `${primaryColor}15` : "transparent", color: page === key ? primaryColor : themeStyles.text, fontWeight: "bold", cursor: "pointer" }}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} style={{ padding: "12px", background: "#fff0f0", color: "#dc3545", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>🚪 Đăng xuất</button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0 }}>Xin chào, {currentUser.name} 👋</h2>
            <span style={{ fontSize: "12px", background: primaryColor, color: "#fff", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>Gói: {userTierObj?.name}</span>
          </div>
          <button onClick={() => setShowQRModal(true)} style={{ background: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: "8px 16px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>📲 Mã QR</button>
        </div>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <div>
            <div style={{ background: primaryColor, borderRadius: "20px", padding: "24px", color: "#fff", marginBottom: "24px" }}>
              <span style={{ fontSize: "13px", opacity: 0.9 }}>Số dư ví khả dụng</span>
              <h1 style={{ fontSize: "36px", margin: "10px 0" }}>{formatMoney(walletBalance)}</h1>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>Hạn mức giao dịch tối đa: {formatMoney(maxTxLimit)}/lần</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "20px", background: "rgba(255,255,255,0.15)", padding: "12px", borderRadius: "14px" }}>
                <div onClick={() => { setTransferForm({ ...transferForm, action: "deposit" }); setShowTransferModal(true); }} style={{ textAlign: "center", cursor: "pointer" }}>📥 Nạp tiền</div>
                <div onClick={() => { setTransferForm({ ...transferForm, action: "withdraw" }); setShowTransferModal(true); }} style={{ textAlign: "center", cursor: "pointer" }}>📤 Rút tiền</div>
                <div onClick={() => setPage("services")} style={{ textAlign: "center", cursor: "pointer" }}>⚡ Dịch vụ</div>
              </div>
            </div>

            <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "20px", border: `1px solid ${themeStyles.border}`, marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0 }}>📊 Thống kê thu chi theo tháng</h3>
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#e6f4ea", padding: "16px", borderRadius: "12px", color: "#198754" }}>
                  <span>Tổng Thu Nhập</span><h3>+{formatMoney(monthlyIncome)}</h3>
                </div>
                <div style={{ background: "#f8d7da", padding: "16px", borderRadius: "12px", color: "#dc3545" }}>
                  <span>Tổng Chi Tiêu</span><h3>-{formatMoney(monthlyExpense)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {page === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "20px", border: `1px solid ${themeStyles.border}` }}>
              <h4>📈 Biến động Thu/Chi</h4><Line data={lineChartData} />
            </div>
            <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "20px", border: `1px solid ${themeStyles.border}` }}>
              <h4>🍩 Phân bổ Chi Tiêu</h4><Doughnut data={doughnutChartData} />
            </div>
          </div>
        )}

        {/* BANKS */}
        {page === "banks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3>🏦 Ngân Hàng Đã Liên Kết</h3>
              <button onClick={() => setShowLinkBankModal(true)} style={{ background: primaryColor, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", cursor: "pointer" }}>＋ Liên kết mới</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {linkedBanks.map((b) => (
                <div key={b.id} style={{ background: "#1e293b", color: "#fff", padding: "20px", borderRadius: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{b.bankName}</strong>
                    <button onClick={() => handleUnlinkBank(b.id)} style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>Hủy liên kết</button>
                  </div>
                  <div style={{ fontSize: "18px", margin: "16px 0" }}>{b.maskedNumber}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Chủ thẻ: {b.accountName} | SD: {formatMoney(b.bankBalance)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {page === "services" && (
          <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "20px", border: `1px solid ${themeStyles.border}` }}>
            <h3>⚡ Thanh toán Dịch vụ tiện ích</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
              {SERVICES_LIST.map((srv) => (
                <div key={srv.id} onClick={() => { setSelectedService(srv); setServicePayForm({ accountCode: "", amount: srv.defaultAmount }); }} style={{ padding: "20px", border: `1px solid ${themeStyles.border}`, borderRadius: "16px", textAlign: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: "32px" }}>{srv.icon}</div>
                  <strong style={{ fontSize: "14px" }}>{srv.name}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEMBERSHIP PLAN */}
        {page === "membership" && (
          <div>
            <h3>👑 Nâng cấp Gói Thành viên</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
              {MEMBERSHIP_PLANS.map((plan) => (
                <div key={plan.id} style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "20px", border: `2px solid ${currentUser.tier === plan.id ? primaryColor : themeStyles.border}`, textAlign: "center" }}>
                  <h4>{plan.name}</h4>
                  <h2 style={{ color: primaryColor }}>{plan.price === 0 ? "Miễn phí" : formatMoney(plan.price)}</h2>
                  <p style={{ fontSize: "13px", color: themeStyles.subText }}>{plan.desc}</p>
                  <button onClick={() => handleUpgradeTier(plan)} disabled={currentUser.tier === plan.id} style={{ width: "100%", padding: "10px", background: currentUser.tier === plan.id ? "#ccc" : primaryColor, color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                    {currentUser.tier === plan.id ? "Đang sử dụng" : "Nâng cấp ngay"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {page === "settings" && (
          <div style={{ background: themeStyles.cardBg, padding: "24px", borderRadius: "20px", border: `1px solid ${themeStyles.border}` }}>
            <h3>⚙️ Tùy chỉnh Giao diện Web</h3>
            <button onClick={() => {
              const newMode = isDarkMode ? "light" : "dark";
              setData({ ...data, users: data.users.map((u) => u.email === currentUser.email ? { ...u, themeMode: newMode } : u) });
            }} style={{ padding: "10px 20px", background: primaryColor, color: "#fff", border: "none", borderRadius: "10px", margin: "16px 0", cursor: "pointer" }}>
              Chuyển sang Chế độ {isDarkMode ? "Sáng ☀️" : "Tối 🌙"}
            </button>
          </div>
        )}
      </main>

      {/* MODAL LIÊN KẾT NGÂN HÀNG */}
      {showLinkBankModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", width: "340px", color: "#000" }}>
            <h3>🏦 Liên kết Ngân hàng</h3>
            <form onSubmit={handleLinkBank} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <select value={linkBankForm.bankCode} onChange={(e) => setLinkBankForm({ ...linkBankForm, bankCode: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                {BANKS.map((b) => (<option key={b.code} value={b.code}>{b.name}</option>))}
              </select>
              <input placeholder="Số tài khoản" value={linkBankForm.accountNumber} onChange={(e) => setLinkBankForm({ ...linkBankForm, accountNumber: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
              <input placeholder="Tên chủ tài khoản (In hoa)" value={linkBankForm.accountName} onChange={(e) => setLinkBankForm({ ...linkBankForm, accountName: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
              <button type="submit" style={{ padding: "10px", background: primaryColor, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Xác nhận liên kết</button>
              <button type="button" onClick={() => setShowLinkBankModal(false)} style={{ padding: "8px", background: "#eee", border: "none", borderRadius: "8px", cursor: "pointer" }}>Hủy</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NẠP / RÚT */}
      {showTransferModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", width: "340px", color: "#000" }}>
            <h3>{transferForm.action === "deposit" ? "📥 Nạp tiền vào Ví" : "📤 Rút tiền về Ngân hàng"}</h3>
            <form onSubmit={handleBankTransfer} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <select value={transferForm.bankId} onChange={(e) => setTransferForm({ ...transferForm, bankId: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <option value="">-- Chọn ngân hàng --</option>
                {linkedBanks.map((b) => (<option key={b.id} value={b.id}>{b.bankName} - {b.maskedNumber}</option>))}
              </select>
              <input type="number" placeholder="Số tiền (VNĐ)" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
              <button type="submit" style={{ padding: "10px", background: primaryColor, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Xác nhận</button>
              <button type="button" onClick={() => setShowTransferModal(false)} style={{ padding: "8px", background: "#eee", border: "none", borderRadius: "8px", cursor: "pointer" }}>Hủy</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MÃ QR */}
      {showQRModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", width: "280px", textAlign: "center", color: "#000" }}>
            <h3>📲 Mã QR Cá Nhân</h3>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=FINORA_${currentUser.email}`} alt="QR" style={{ margin: "12px 0" }} />
            <div><strong>{currentUser.name}</strong></div>
            <button onClick={() => setShowQRModal(false)} style={{ marginTop: "12px", width: "100%", padding: "8px", background: "#eee", border: "none", borderRadius: "8px", cursor: "pointer" }}>Đóng</button>
          </div>
        </div>
      )}

      {/* MODAL THANH TOÁN DỊCH VỤ */}
      {selectedService && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", width: "340px", color: "#000" }}>
            <h3>{selectedService.icon} {selectedService.name}</h3>
            <form onSubmit={handlePayService} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <input placeholder="Mã KH / Số ĐT" value={servicePayForm.accountCode} onChange={(e) => setServicePayForm({ ...servicePayForm, accountCode: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
              <input type="number" placeholder="Số tiền thanh toán" value={servicePayForm.amount} onChange={(e) => setServicePayForm({ ...servicePayForm, amount: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
              <button type="submit" style={{ padding: "10px", background: primaryColor, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Thanh toán</button>
              <button type="button" onClick={() => setSelectedService(null)} style={{ padding: "8px", background: "#eee", border: "none", borderRadius: "8px", cursor: "pointer" }}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;