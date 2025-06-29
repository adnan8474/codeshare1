import { Link } from 'react-router-dom';
import logo from '/logo.png';
import InstructionsDropdown from '../components/InstructionsDropdown';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <img src={logo} alt="POCTIFY" className="w-24 h-24 mb-4" />
      <h1 className="text-3xl font-bold mb-2">POCTIFY Usage Intelligence</h1>
      <p className="mb-6 text-lg max-w-xl">
        Detect barcode sharing, device misuse and workflow anomalies in your POCT
        program. All data is processed securely in your browser.
      </p>
      <Link to="/dashboard" className="px-4 py-2 bg-soft-blue rounded hover:bg-blue-700">
        Get Started
      </Link>
      <InstructionsDropdown />
    </div>
  );
}
