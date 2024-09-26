import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Q1nauCQBLWpKgeplmR3WycD3CWWuw5qIz611n8PAT4mxKt6y9OF7Dz3accorXcu13L1xWmnvEnPOqCpqs5OiSka00ocBf4c4k',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // console.log(session);

    // 2) Create checkout form + chanre credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    if (session.status === 'open') {
      window.open(session.url, '_self');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
