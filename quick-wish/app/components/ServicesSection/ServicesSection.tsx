
import { Gift, MessageSquareText, Shield, Truck } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section className="bg-[color:var(--ivory)] py-8 px-4 mt-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
          <div className="text-center p-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            <Truck className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">🚚 Same-Day Delivery</h3>
            <p className="text-xs text-[color:var(--muted)]">Fast delivery available across Indore.</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            <Gift className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">🎁 Handmade with Care</h3>
            <p className="text-xs text-[color:var(--muted)]">Every gift is packed by hand with attention to detail.</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            <MessageSquareText className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">💌 Personalized Notes</h3>
            <p className="text-xs text-[color:var(--muted)]">Add your custom message to make every gift special.</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            <Shield className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">Trusted payments</h3>
            <p className="text-xs text-[color:var(--muted)]">Secure checkout and clear pricing.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
