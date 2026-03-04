import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <img src={product.image} alt="" className="h-40 w-full object-cover" />
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      <p className="text-green-700 font-bold">{product.price} EGP</p>
      <Link to={`/product/${product._id}`} className="text-sm text-blue-500">
        View Details
      </Link>
    </div>
  );
}
