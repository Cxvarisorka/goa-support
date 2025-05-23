import React from "react";

const Home = React.memo(() => {
  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <section className="max-w-3xl bg-white rounded-lg shadow-md p-8 md:p-12">
            <h2 className="text-green-600 text-3xl md:text-4xl font-bold mb-4">
                ჩვენს შესახებ
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                მოგესალმებით მოსწავლეებო, მენტორებო და ლიდერებო. ეს საიტი არის GOA_ს
                სტუდენტებისთვის, თუ რაიმეში დახმარება დაგჭირდებათ ამ საიტზე შეგეძლებათ
                შეკითხვების დადება.
            </p>
        </section>
    </main>
  );
});

export default Home;
