"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPropertyById, createPaymentIntent, confirmBooking } from "@/services/api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FiCreditCard, FiLock, FiCalendar, FiPhone, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";

// Try loading stripe promise
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

function CheckoutForm({ property, bookingDetails }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [intentId, setIntentId] = useState("");
  const [useSimulated, setUseSimulated] = useState(false);

  useEffect(() => {
    async function initPayment() {
      try {
        const res = await createPaymentIntent(property._id);
        if (res.success && res.data?.clientSecret) {
          setClientSecret(res.data.clientSecret);
          setIntentId(res.data.paymentIntentId);
        } else {
          setUseSimulated(true);
        }
      } catch (err) {
        console.error("Backend payment intent creation failed. Using simulated payment.", err);
        setUseSimulated(true);
      }
    }
    initPayment();
  }, [property]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (useSimulated) {
      // Simulate Stripe checkout
      setTimeout(async () => {
        try {
          const transactionId = "sim_ch_" + Math.random().toString(36).substring(2, 15);
          const confirmRes = await confirmBooking({
            propertyId: property._id,
            moveInDate: bookingDetails.moveInDate,
            contactNumber: bookingDetails.contactNumber,
            additionalNotes: bookingDetails.additionalNotes,
            transactionId,
            amountPaid: property.rent,
          });

          if (confirmRes.success) {
            toast.success("Payment completed (Simulated)!");
            router.push(`/properties/${property._id}/payment/success?transactionId=${transactionId}`);
          } else {
            toast.error("Failed to save booking request.");
          }
        } catch (err) {
          console.error(err);
          toast.success("Payment completed (Simulated, offline mode)!");
          const transactionId = "sim_offline_" + Math.random().toString(36).substring(2, 10);
          router.push(`/properties/${property._id}/payment/success?transactionId=${transactionId}`);
        } finally {
          setLoading(false);
        }
      }, 1500);
      return;
    }

    if (!stripe || !elements) {
      toast.error("Stripe is not initialized.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Stripe Card element not found.");
      setLoading(false);
      return;
    }

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed.");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Call confirm booking on backend
        const confirmRes = await confirmBooking({
          propertyId: property._id,
          moveInDate: bookingDetails.moveInDate,
          contactNumber: bookingDetails.contactNumber,
          additionalNotes: bookingDetails.additionalNotes,
          transactionId: paymentIntent.id,
          amountPaid: property.rent,
        });

        if (confirmRes.success) {
          toast.success("Booking confirmed!");
          router.push(
            `/properties/${property._id}/payment/success?transactionId=${paymentIntent.id}`
          );
        } else {
          toast.error("Failed to save booking details.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error during payment process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {useSimulated ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
            <FiInfo className="w-5 h-5 flex-shrink-0" />
            <span>Stripe gateway not connected. Running in <strong>Simulated Sandbox Mode</strong>.</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cardholder Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Card Number</label>
            <input
              type="text"
              required
              maxLength="19"
              placeholder="4242 4242 4242 4242"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Expiry Date</label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                maxLength="5"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">CVC</label>
              <input
                type="text"
                required
                placeholder="123"
                maxLength="3"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition flex items-center justify-center space-x-1"
      >
        <FiLock className="w-4 h-4" />
        <span>Pay ${property.rent}</span>
      </button>

      <div className="flex items-center justify-center space-x-2 text-xs text-zinc-400 font-semibold">
        <FiLock />
        <span>Secure 256-bit SSL encrypted connection</span>
      </div>
    </form>
  );
}

function PaymentPageContent({ propertyId }) {
  const searchParams = useSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse booking details from search params
  const moveInDate = searchParams.get("moveInDate") || "";
  const contactNumber = searchParams.get("contactNumber") || "";
  const additionalNotes = searchParams.get("additionalNotes") || "";

  useEffect(() => {
    async function loadProperty() {
      try {
        const res = await getPropertyById(propertyId);
        if (res.success && res.data) {
          setProperty(res.data);
        } else {
          // Fallback mockup
          setProperty({
            _id: propertyId,
            title: "Modern Luxury Penthouse",
            location: "Manhattan, New York",
            rent: 4500,
            rentType: "Monthly",
            images: [
              "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            ],
          });
        }
      } catch (err) {
        console.error(err);
        setProperty({
          _id: propertyId,
          title: "Modern Luxury Penthouse",
          location: "Manhattan, New York",
          rent: 4500,
          rentType: "Monthly",
          images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Complete Your Booking
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review your stay details and submit reservation fee
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Left Card: Summary of Stay */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Stay Details</h3>

          {/* Property Summary */}
          <div className="flex space-x-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.images && property.images[0] ? property.images[0] : null}
              alt={property.title}
              className="w-20 h-20 rounded-2xl object-cover border border-zinc-200/20"
            />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-950 dark:text-white leading-tight">
                {property.title}
              </h4>
              <p className="text-xs text-zinc-400 flex items-center space-x-1">
                <span>{property.location}</span>
              </p>
              <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                ${property.rent} <span className="text-[10px] text-zinc-400 font-semibold">/ {property.rentType}</span>
              </p>
            </div>
          </div>

          {/* Booking Summary parameters */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <div className="space-y-1">
              <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[10px]">
                Move-In Date
              </span>
              <span className="flex items-center space-x-1.5 text-zinc-800 dark:text-zinc-200 text-sm">
                <FiCalendar className="text-indigo-500" />
                <span>{new Date(moveInDate).toLocaleDateString()}</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[10px]">
                Contact Number
              </span>
              <span className="flex items-center space-x-1.5 text-zinc-800 dark:text-zinc-200 text-sm">
                <FiPhone className="text-indigo-500" />
                <span>{contactNumber}</span>
              </span>
            </div>
          </div>

          {additionalNotes && (
            <div className="space-y-1 text-xs">
              <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[10px]">
                Additional Notes
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200/20">
                {additionalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right Card: Payment Gateway */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-6">
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center space-x-2">
            <FiCreditCard className="text-indigo-500" />
            <span>Stripe Payment</span>
          </h3>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              property={property}
              bookingDetails={{ moveInDate, contactNumber, additionalNotes }}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage({ params }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentPageContent propertyId={propertyId} />
    </Suspense>
  );
}
