const fs = require('fs');

let code = fs.readFileSync('temp_hub.txt', 'utf8');

// Replace imports
code = code.replace(/import apiService from '..\/..\/services\/apiService';/g, '');
code = code.replace(/import { BASE_URL } from '..\/..\/constants';/g, '');
code = code.replace(/import { formatCurrency, getOrderTotal } from '..\/..\/utils\/formatters';/g, 
  "const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'}).format(val || 0);\nconst getOrderTotal = (o) => o.grandTotal || o.grand_total || 0;");

// Transform the component definition
code = code.replace(/const ReportsHub = \(\{.*?\}\) => \{/, 
`export default function Dashboard() {
  const [orderHistory, setOrderHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/dashboard/orders?all=true');
        const data = await res.json();
        if(data.success) {
          setOrderHistory(data.orders);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchOrders();
    const intv = setInterval(fetchOrders, 30000);
    return () => clearInterval(intv);
  }, []);
`);

// Transform export
code = code.replace(/export default ReportsHub;/, '');

code = '"use client";\n' + code;

fs.writeFileSync('app/page.js', code);
console.log('Successfully written app/page.js');
