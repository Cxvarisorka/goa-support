import React from "react";

const Home = React.memo(() => {
    return (
        <main>
            <section>
                <h2 className=" text-blue-400">ჩვენს შესახებ</h2>
                <p>მოგესალმებით მოსწავლეებო, მენტორებო და ლიდერებო. ეს საიტი არის GOA_ს სტუდენტებისთვის, თუ რაიმეში დახმარება დაგჭირდებათ ამ საიტზე შეგეძლებათ შეკითხვების დადება.</p>
            </section>
        </main>
    )
})

export default Home;