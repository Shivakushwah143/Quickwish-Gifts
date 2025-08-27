import  ProductDetailPage  from '../../components/ProductDetailPage';

export default function ProductPage({ params }: { params: { id: string } }) {
 
  const productTitle = "Some Product"; 
  return <ProductDetailPage  />;
}
