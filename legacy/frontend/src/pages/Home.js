import React from 'react';
import Header from '../components/Home/HomeHeader';
import Footer from '../components/Home/HomeFooter';
import Hero from '../components/Home/Hero';
import Features from '../components/Home/Features';
import Testimonials from '../components/Home/Testimonials';
import CallToAction from '../components/Home/CallToAction';
import  '../css/Home/Home.css';

const Home = () => {
  return (
    <>
      <Header />
      <main className="main">
        <Hero />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
};

export default Home;
