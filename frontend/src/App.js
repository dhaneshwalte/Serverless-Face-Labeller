import './App.css';
import Routes from './Routes';
import { UserContextProvider } from "./contexts/provider"

function App() {
  return (
    <UserContextProvider>
      <div className="App">
        <Routes />
      </div>
    </UserContextProvider>
  );
}

export default App;
