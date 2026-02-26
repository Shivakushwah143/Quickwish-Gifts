
import { Truck, Clock, Shield, Award } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section className="bg-[color:var(--ivory)] py-8 px-4 mt-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 lux-card">
            <Truck className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">Same-day in Indore</h3>
            <p className="text-xs text-[color:var(--muted)]">Delivered within hours, with care.</p>
          </div>
          
          <div className="text-center p-4 lux-card">
            <Clock className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">Timed to the moment</h3>
            <p className="text-xs text-[color:var(--muted)]">Quietly precise, never rushed.</p>
          </div>
          
          <div className="text-center p-4 lux-card">
            <Shield className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">Trusted payments</h3>
            <p className="text-xs text-[color:var(--muted)]">Secure checkout, discreet handling.</p>
          </div>
          
          <div className="text-center p-4 lux-card">
            <Award className="h-8 w-8 text-[color:var(--gold)] mx-auto mb-2" />
            <h3 className="font-medium text-[color:var(--plum)] mb-1">Curated quality</h3>
            <p className="text-xs text-[color:var(--muted)]">Every detail is hand-finished.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
