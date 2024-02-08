import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import SideDrawer from "./SideDrawer.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
        <SideDrawer triggerSelector={'.sc-5db1afd3-16.bwGvYE'} />
    </div>
  );
}

export default App;
