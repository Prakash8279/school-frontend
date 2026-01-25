import { Helmet } from "react-helmet";

const SearchPage = () => {
  return (
    <>
      <Helmet>
        <title>Search - R.N.T Public School, Janki Nagar Basabtpur</title>
        <meta name="description" content="Search results for R.N.T Public School, Janki Nagar Basabtpur. Find information about admissions, academics, facilities, and more." />
        <meta name="keywords" content="RNT Public School, Janki Nagar Basabtpur, school search, admission, academics, facilities" />
        <meta property="og:title" content="Search - R.N.T Public School, Janki Nagar Basabtpur" />
        <meta property="og:description" content="Search results for R.N.T Public School, Janki Nagar Basabtpur. Find information about admissions, academics, facilities, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.rntpublicschool.in/logo.png" />
      </Helmet>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        {/* Search results content here */}
      </div>
    </>
  );
};

export default SearchPage;
