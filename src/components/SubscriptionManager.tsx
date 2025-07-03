
import { useState, useEffect } from 'react';
import { Crown, Check, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  maxRepurposes: number;
  popular?: boolean;
}

interface UserSubscription {
  plan: string;
  status: string;
  repurposesUsed: number;
  repurposesLimit: number;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    maxRepurposes: 3,
    features: [
      '3 AI repurposes per month',
      'Basic content upload',
      'Standard templates',
      'Community support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    interval: 'month',
    maxRepurposes: -1, // unlimited
    popular: true,
    features: [
      'Unlimited AI repurposes',
      'Advanced content scheduling',
      'Multiple file format support',
      'Analytics dashboard',
      'Priority support',
      'Custom templates'
    ]
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 49,
    interval: 'month',
    maxRepurposes: -1, // unlimited
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced analytics',
      'API access',
      'White-label options',
      'Dedicated account manager'
    ]
  }
];

const SubscriptionManager = () => {
  const [currentPlan, setCurrentPlan] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In a real app, this would fetch from your subscription service
      // For now, we'll mock the data
      const mockSubscription: UserSubscription = {
        plan: 'free',
        status: 'active',
        repurposesUsed: 1,
        repurposesLimit: 3,
      };

      setCurrentPlan(mockSubscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Failed to load subscription info');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error('Please login to upgrade');
      return;
    }

    try {
      // In a real app, this would integrate with Stripe
      toast.info('Stripe integration coming soon!');
      console.log('Upgrading to plan:', planId);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan');
    }
  };

  const getCurrentPlanInfo = () => {
    return plans.find(plan => plan.id === currentPlan?.plan) || plans[0];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="card-modern animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </Card>
      </div>
    );
  }

  const currentPlanInfo = getCurrentPlanInfo();

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      {currentPlan && (
        <Card className="card-modern border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Crown className="w-6 h-6 mr-3 text-purple-600" />
              Your Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentPlanInfo.name}</h3>
                <p className="text-gray-600">
                  {currentPlanInfo.price === 0 ? 'Free forever' : `$${currentPlanInfo.price}/month`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">This month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentPlan.repurposesUsed} / {currentPlan.repurposesLimit === -1 ? '∞' : currentPlan.repurposesLimit}
                </p>
                <p className="text-xs text-gray-500">repurposes used</p>
              </div>
            </div>
            
            {currentPlan.repurposesLimit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPlan.repurposesUsed / currentPlan.repurposesLimit) * 100}%` }}
                ></div>
              </div>
            )}

            {currentPlan.plan === 'free' && currentPlan.repurposesUsed >= currentPlan.repurposesLimit && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 font-medium">
                  You've reached your monthly limit! Upgrade to continue repurposing content.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-3xl font-bold brand-gradient-text mb-8">Choose Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`card-modern relative ${plan.popular ? 'border-2 border-purple-500 scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="mb-4">
                  {plan.id === 'free' && <Zap className="w-12 h-12 mx-auto text-gray-500" />}
                  {plan.id === 'pro' && <Crown className="w-12 h-12 mx-auto text-purple-600" />}
                  {plan.id === 'agency' && <Users className="w-12 h-12 mx-auto text-emerald-600" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-500">/{plan.interval}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-3 ${
                    currentPlan?.plan === plan.id
                      ? 'btn-secondary-modern'
                      : plan.popular
                      ? 'btn-primary-modern'
                      : 'btn-secondary-modern'
                  }`}
                  disabled={currentPlan?.plan === plan.id}
                >
                  {currentPlan?.plan === plan.id ? 'Current Plan' : 
                   plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens if I exceed my limit?</h4>
              <p className="text-gray-600">Free users will need to upgrade to continue. Pro and Agency users have unlimited repurposes.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a refund policy?</h4>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
