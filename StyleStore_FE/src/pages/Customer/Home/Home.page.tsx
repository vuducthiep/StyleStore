import React from 'react';
import { Header } from '../../../components/Header';
import Footer from '../../../components/Footer';
import Banner from '../Home/Banner';
import ListProduct from '../Home/ListProduct';

const Home: React.FC = () => {
    return (
        <div>
            <Header />
            <Banner />
            <ListProduct />

            <Footer />
        </div>
    );
};

export default Home;
