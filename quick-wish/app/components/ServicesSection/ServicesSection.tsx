
import { Truck, Clock, Shield, Award } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section className="bg-white py-6 px-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <Truck className="h-8 w-8 text-pink-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Same Day Delivery</h3>
          <p className="text-xs text-gray-600">Available in 400+ cities</p>
        </div>
        
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <Clock className="h-8 w-8 text-pink-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Midnight Delivery</h3>
          <p className="text-xs text-gray-600">Make it extra special</p>
        </div>
        
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <Shield className="h-8 w-8 text-pink-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">100% Safe</h3>
          <p className="text-xs text-gray-600">Secure payments</p>
        </div>
        
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <Award className="h-8 w-8 text-pink-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Quality Assured</h3>
          <p className="text-xs text-gray-600">Premium products</p>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;