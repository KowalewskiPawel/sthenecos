import React from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/supabase';
import Button from './ui/Button';
import { Check, Star, Zap, Crown, Loader, AlertTriangle, ExternalLink } from 'lucide-react';

const SubscriptionPlans: React.FC = () => {
  const { user, checkSubscription } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: null,
      icon: <Star className="h-6 w-6" />,
      features: [
        '3 AI trainer conversations per month',
        'Basic workout library access',
        'Progress tracking',
        'Community support'
      ],
      limitations: [
        'Limited video generation',
        'No custom personas',
        'Basic form analysis'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      priceId: 'price_premium_monthly',
      icon: <Zap className="h-6 w-6" />,
      popular: true,
      features: [
        'Unlimited AI trainer conversations',
        'Full workout program library',
        'Advanced form analysis',
        'Custom trainer personas',
        'Video generation (5 per month)',
        'Priority support',
        'Mobile app access'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49.99,
      priceId: 'price_pro_monthly',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Everything in Premium',
        'Unlimited video generation',
        'Custom workout program creation',
        'White-label trainer dashboard',
        'API access',
        'Advanced analytics',
        'Custom branding',
        'Dedicated support'
      ]
    }
  ];

  const handleSubscribe = async (priceId: string) => {
    if (!user || !priceId) return;
    
    setLoading(priceId);
    setError(null);
    
    try {
      const { url } = await paymentService.createCheckoutSession(priceId, user.id);
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      let errorMessage = 'Failed to create checkout session. ';
      
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        errorMessage += 'Our payment system is currently being configured. Please contact support for manual setup.';
      } else if (error.message?.includes('API key')) {
        errorMessage += 'Payment processing is not fully configured. Please contact support.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Choose Your Fitness Journey
        </h2>
        <p className="text-text-secondary text-lg">
          Start free and upgrade when you're ready for more advanced features
        </p>
        
        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-red-200 text-sm">{error}</p>
                {error.includes('contact support') && (
                  <a 
                    href="mailto:support@fitai.com" 
                    className="inline-flex items-center mt-2 text-red-300 hover:text-red-200 text-sm"
                  >
                    Contact Support <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-card rounded-2xl border p-8 ${
              plan.popular 
                ? 'border-primary shadow-lg scale-105' 
                : 'border-background'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-background px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-lg ${
                plan.popular ? 'bg-primary text-background' : 'bg-background text-primary'
              }`}>
                {plan.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-text-primary">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-text-secondary ml-1">/month</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary ml-3 text-sm">{feature}</span>
                </div>
              ))}
              
              {plan.limitations && plan.limitations.map((limitation, index) => (
                <div key={index} className="flex items-start opacity-60">
                  <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <div className="w-1 h-1 bg-text-secondary rounded-full"></div>
                  </div>
                  <span className="text-text-secondary ml-3 text-sm">{limitation}</span>
                </div>
              ))}
            </div>

            <Button
              variant={plan.popular ? "primary" : "outline"}
              className="w-full"
              onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
              disabled={loading === plan.priceId || (plan.id === 'free') || (user?.subscription_tier === plan.id)}
            >
              {loading === plan.priceId ? (
                <div className="flex items-center">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : plan.id === 'free' ? (
                'Free Forever'
              ) : user?.subscription_tier === plan.id ? (
                'Current Plan'
              ) : (
                `Get ${plan.name}`
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-text-secondary text-sm">
          All paid plans include a 7-day free trial. Cancel anytime. Secure payment processing by Stripe.
        </p>
        <p className="text-text-secondary text-xs mt-2">
          Payment processing is currently being configured. Contact support for immediate access.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;