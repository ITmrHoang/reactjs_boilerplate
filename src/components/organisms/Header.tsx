import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <Link
          to="/posts"
          className="text-xl font-bold text-gray-800"
        >
          Post list
        </Link>
      </nav>
    </header>
  );
};

export default Header;
