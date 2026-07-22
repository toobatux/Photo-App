import { useEffect } from "react";
import "./App.css";
import { Link } from "react-router";
import { customFetch } from "./services/api";

function App() {
  return (
    <div className="flex flex-col gap-4">
      <h2>Index</h2>
      <Link to={"/feed"} className="underline hover:text-white">
        Feed
      </Link>
    </div>
  );
}

export default App;
