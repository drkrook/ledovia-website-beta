export type BillingPeriod = 'monthly' | 'annual';
export type ConsumerPackage = 'travel' | 'survival';

// Owner-supplied Beta evaluation examples, not commercial prices or entitlements.
const examples = {
 travel: { monthly: 499, annual: 4999 },
 survival: { monthly: 799, annual: 7999 },
} as const;

export function getPriceExample(plan: ConsumerPackage, period: BillingPeriod) {
 return {
  amount: `$${(examples[plan][period] / 100).toFixed(2)}`,
  suffix: period === 'annual' ? '/ year' : '/ month',
 };
}
