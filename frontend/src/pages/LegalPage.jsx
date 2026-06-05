import { Link, Navigate } from 'react-router-dom';
import { affiliationNotice, legalConfig } from '../config/legal.js';

const policyPages = {
  terms: {
    title: 'Terms of Sale',
    intro: 'These terms apply when you buy products from this website.',
    sections: [
      {
        heading: 'Seller information',
        content: [
          `${legalConfig.businessName} trades as ${legalConfig.legalEntity}.`,
          `Trading address: ${legalConfig.tradingAddress}.`,
          `Customer support: ${legalConfig.contactEmail}. We aim to respond within ${legalConfig.supportResponseTime}.`,
          legalConfig.vatRegistered ? `VAT number: ${legalConfig.vatNumber}.` : 'Not VAT registered.'
        ]
      },
      {
        heading: 'Products',
        content: [
          'We sell sealed Pokemon TCG products and individual Pokemon TCG single cards.',
          'Single card listings show the card name, set, number, rarity, condition, language, and other relevant details where available.',
          'Sealed product listings show the product name, category, set, sealed condition, quantity, and product details where available.',
          'Photos and descriptions are part of the listing. Please review them before purchase.'
        ]
      },
      {
        heading: 'Prices and payment',
        content: [
          `All prices are shown in ${legalConfig.currency}.`,
          'Checkout is processed using Stripe Checkout. We do not store full card details on our servers.',
          'We validate product prices and stock from our database before creating a Stripe Checkout Session.'
        ]
      },
      {
        heading: 'Orders',
        content: [
          'An order is placed when payment is completed through Stripe Checkout.',
          'If an item becomes unavailable before payment is confirmed, we may cancel the affected order or contact you to resolve it.',
          'Stock is reduced only after payment confirmation has been received.'
        ]
      },
      {
        heading: 'Consumer rights',
        content: [
          'Nothing in these terms limits your statutory rights under UK consumer law.',
          'For online purchases, consumers normally have cancellation rights for non-faulty goods. See our Returns and refunds page for details.',
          'If goods are faulty, not as described, or not of satisfactory quality, contact us so we can resolve the issue.'
        ]
      },
      {
        heading: 'Age and responsible collecting',
        content: [
          `You must be at least ${legalConfig.minimumAge} to place an order, or have permission from a parent or guardian.`,
          'Trading cards are collectible goods. Product value can rise or fall, and sealed products do not guarantee any specific card pull or resale value.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This notice explains how we collect and use personal information when you use this store.',
    sections: [
      {
        heading: 'Who controls your data',
        content: [
          `${legalConfig.businessName} is the controller for customer account, order, newsletter, and support data collected through this website.`,
          `Contact us about privacy at ${legalConfig.contactEmail}.`
        ]
      },
      {
        heading: 'Information we collect',
        content: [
          'Account details such as name, email address, and hashed password.',
          'Order details including basket items, delivery address, email address, phone number if supplied, payment status, shipping rates, tracking information, and order history.',
          'Newsletter signup details such as email address, name if supplied, signup source, consent status, and unsubscribe status.',
          'Technical information needed to run the store, such as authentication tokens and basket identifiers stored in your browser.'
        ]
      },
      {
        heading: 'Why we use personal information',
        content: [
          'To create and manage customer accounts.',
          'To process orders, payments, delivery, returns, refunds, support requests, fraud prevention, and legal record keeping.',
          'To send newsletter emails only where you have signed up or where law permits us to contact you.',
          'To secure the website and prevent misuse.'
        ]
      },
      {
        heading: 'Legal bases',
        content: [
          'Contract: to process orders, payment, delivery, and customer account services.',
          'Legal obligation: to keep accounting, tax, and consumer law records where required.',
          'Legitimate interests: to secure the website, prevent fraud, handle support, and improve business operations.',
          'Consent: for optional newsletter marketing where consent is required.'
        ]
      },
      {
        heading: 'Processors and third parties',
        content: [
          'Stripe processes payment data for checkout.',
          'Shippo and selected carriers process delivery and tracking data.',
          'PokeWallet may be queried by admins to help create card listings; PokeWallet API keys are kept server-side.',
          'We may disclose information if required by law or to protect legal rights.'
        ]
      },
      {
        heading: 'Retention',
        content: [
          'We keep order records for as long as needed for accounting, tax, consumer rights, fraud prevention, and dispute handling.',
          'Newsletter records are kept until you unsubscribe or ask us to delete them, unless we need to retain limited suppression records.',
          'Account data is kept while your account remains active, then deleted or anonymised where appropriate.'
        ]
      },
      {
        heading: 'Your rights',
        content: [
          'You may ask for access, correction, deletion, restriction, objection, portability, or withdrawal of consent where these rights apply.',
          'You can complain to the UK Information Commissioner’s Office if you are unhappy with how your data is handled.'
        ]
      }
    ]
  },
  cookies: {
    title: 'Cookies and Browser Storage',
    intro: 'This store currently uses essential browser storage only.',
    sections: [
      {
        heading: 'What we use',
        content: [
          'Basket storage: keeps your basket token so your basket can be restored while browsing.',
          'Login storage: keeps your authentication token after you sign in.',
          'Cookie notice storage: remembers that you have seen the cookies and storage notice.'
        ]
      },
      {
        heading: 'Payments and shipping providers',
        content: [
          'Stripe Checkout may use cookies or similar technologies on Stripe-hosted checkout pages.',
          'Shippo and delivery carriers may process delivery information to generate rates, labels, and tracking.'
        ]
      },
      {
        heading: 'Analytics and advertising',
        content: [
          'We do not currently use analytics, advertising, or behavioural tracking cookies on this website.',
          'If we add non-essential cookies or tracking later, this notice and the consent controls should be updated before they are enabled.'
        ]
      }
    ]
  },
  returns: {
    title: 'Returns and Refunds',
    intro: 'This policy explains how returns work for online orders.',
    sections: [
      {
        heading: 'Cancellation rights',
        content: [
          'For most online consumer orders, you have 14 days from receiving the goods to tell us that you want to cancel.',
          'After telling us you want to cancel, you normally have another 14 days to return the goods.',
          'We will refund eligible cancelled orders after receiving the goods back or receiving evidence that you have sent them back.'
        ]
      },
      {
        heading: 'Condition of returned goods',
        content: [
          'Products must be returned in the same condition supplied.',
          'Sealed products should remain sealed and undamaged where the return is not due to a fault.',
          'Single cards must be returned in the same sleeve, top loader, team bag, or packaging condition supplied.',
          'If goods are handled beyond what is necessary to inspect them, we may make a lawful deduction from the refund where permitted.'
        ]
      },
      {
        heading: 'Faulty, damaged, or not as described goods',
        content: [
          'Contact us as soon as possible if an item arrives damaged, faulty, or not as described.',
          'Please keep the item, packaging, and delivery materials while we review the issue.',
          'Your statutory rights are not affected.'
        ]
      },
      {
        heading: 'Return postage',
        content: [
          'For cancellation of non-faulty goods, you are normally responsible for return postage unless we agree otherwise.',
          'For faulty, damaged, or not-as-described goods, contact us first so we can advise the correct return route.'
        ]
      }
    ]
  },
  shipping: {
    title: 'Shipping Policy',
    intro: `We currently ship to ${legalConfig.shippingCountries}.`,
    sections: [
      {
        heading: 'Delivery area',
        content: [
          `We currently only accept delivery addresses in ${legalConfig.shippingCountries}.`,
          'Orders with non-UK delivery addresses may be rejected or cancelled.'
        ]
      },
      {
        heading: 'Rates and services',
        content: [
          'Shipping rates are requested from Shippo using the delivery address and basket weight/dimensions.',
          'Available carrier services are shown at checkout before payment.',
          'Shipping prices are validated server-side before Stripe Checkout is created.'
        ]
      },
      {
        heading: 'Dispatch and tracking',
        content: [
          `We aim to dispatch orders within ${legalConfig.dispatchEstimate}.`,
          'Tracking details will be shown on your order where the selected carrier provides tracking.',
          'Delivery estimates are provided by carriers and are not guaranteed unless the selected carrier service expressly guarantees them.'
        ]
      },
      {
        heading: 'Packaging',
        content: [
          'Single cards are packed to protect condition during normal transit.',
          'Sealed products are packed to reduce movement and visible damage during delivery.',
          'Please photograph packaging before opening if it arrives damaged.'
        ]
      },
      {
        heading: 'Damage caused during delivery',
        content: [
          'If your parcel arrives visibly damaged, photograph the outside packaging before opening it and keep all packaging, labels, and delivery materials.',
          'Contact us as soon as possible with your order number, photos, and a description of the damage so we can review the issue and raise it with the carrier where appropriate.',
          'You may also be asked to report the damage to the delivery company, because the carrier controls delivery handling records and may need evidence from the recipient.',
          'Once a parcel has been safely delivered to you, to a person you nominated, or to a safe place you selected, we are not responsible for damage that happens after delivery.',
          'This does not affect your statutory rights if goods arrive damaged, faulty, or not as described.'
        ]
      }
    ]
  },
  'product-warnings': {
    title: 'Product Warnings',
    intro: 'Please read these warnings before buying sealed products or single cards.',
    sections: [
      {
        heading: 'Collectible goods',
        content: [
          'Pokemon TCG products are collectible trading card goods. Market prices can rise or fall.',
          'Buying sealed products does not guarantee any specific card, grade, pull rate, or resale value.',
          'Card condition grading is a visual assessment unless the listing states that a card has been graded by a named grading company.'
        ]
      },
      {
        heading: 'Safety',
        content: [
          'Trading card products and packaging may contain small parts and are not suitable for children under 3 years old.',
          'Keep packaging, sleeves, top loaders, team bags, and small accessories away from young children.',
          'Adult supervision is recommended where children open sealed products.'
        ]
      },
      {
        heading: 'Authenticity and affiliation',
        content: [
          affiliationNotice,
          'We aim to list authentic products accurately. If you believe a listing is incorrect, contact us before purchase or as soon as possible after delivery.'
        ]
      }
    ]
  },
  contact: {
    title: 'Contact and Business Information',
    intro: 'Use these details for order, return, privacy, and legal enquiries.',
    sections: [
      {
        heading: 'Business details',
        content: [
          `Trading name: ${legalConfig.businessName}.`,
          `Legal entity: ${legalConfig.legalEntity}.`,
          `Trading address: ${legalConfig.tradingAddress}.`,
          legalConfig.vatRegistered ? `VAT number: ${legalConfig.vatNumber}.` : 'Not VAT registered.'
        ]
      },
      {
        heading: 'Contact',
        content: [
          `Email: ${legalConfig.contactEmail}.`,
          `Typical response time: ${legalConfig.supportResponseTime}.`,
          'Please include your order number when contacting us about an existing order.'
        ]
      }
    ]
  }
};

export default function LegalPage({ page }) {
  const policy = policyPages[page];

  if (!policy) {
    return <Navigate to="/legal/terms" replace />;
  }

  return (
    <main className="page legal-page">
      <Link className="back-link" to="/">Back to store</Link>
      <h1>{policy.title}</h1>
      <p className="legal-updated">Last updated: {legalConfig.lastUpdated}</p>
      <p className="legal-intro">{policy.intro}</p>

      {policy.sections.map((section) => (
        <section className="legal-section" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
