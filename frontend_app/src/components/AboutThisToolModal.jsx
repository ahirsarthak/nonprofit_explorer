import { useState, useEffect } from "react";

const defaultButtonClass = "min-w-[120px] px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-semibold shadow text-center";

export default function AboutThisToolModal({ buttonClass = defaultButtonClass }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("aboutSeen")) {
      setOpen(true);
      localStorage.setItem("aboutSeen", "true");
    }
  }, []);

  return (
    <>
      <button className={buttonClass} onClick={() => setOpen(true)}>
        About
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto border border-blue-200 flex flex-col">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-2xl z-10"
              onClick={() => setOpen(false)}
              aria-label="Close About"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4 text-blue-700">About This Project</h3>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 w-full gap-2">
              <div className="flex flex-col items-center md:items-start">
                <span className="block text-blue-900 font-semibold text-sm">by Sarthak Ahir</span>
                <span className="block text-xs text-blue-700">Software & Data Enthusiast</span>
              </div>
              <div className="flex flex-col items-center md:items-end gap-1 mt-2 md:mt-0 text-xs break-all">
                <a href="https://www.linkedin.com/in/sarthakahir" target="https://www.linkedin.com/in/sarthakahir" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
                  linkedin.com/in/ahirsarthak
                </a>
                <a href="https://github.com/ahirsarthak" target="https://github.com/ahirsarthak" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
                  github.com/ahirsarthak
                </a>
              </div>
            </div>
            <Section title="Overview & Significance">
              <li>This project is a full-stack data exploration platform for nonprofit BMO data in the United States.</li>
              <li>It enables users to query, analyze, and visualize large-scale nonprofit datasets with ease, leveraging cloud and open-source technologies.</li>
            </Section>

            <Section title="What are BMO Files?">
              <li>BMO files refer to the raw data files containing bulk nonprofit organization information sourced from IRS.</li>
              <li>These files include details such as Employer Identification Number (EIN), organization name, address, state, city, revenue, group exemption, and IRS subsection codes.</li>
              <li>The project ingests, processes, and makes these BMO files queryable for end users, allowing for powerful search and reporting capabilities.</li>
            </Section>

            <Section title="Project Significance">
              <li>Easier access to nonprofit BMO data for researchers, analysts, and the public.</li>
              <li>Handles large-scale data efficiently using distributed computing and modern data lakehouse architecture.</li>
              <li>Provides a user-friendly, modern interface for both technical and non-technical users.</li>
              <li>Enables advanced data viz analytics (in progress) through Trino SQL and natural language queries.</li>
            </Section>

            <Divider />

            <Section title="Technical Architecture">
              <Subsection title="Data Processing">
                <li><b>Processing Engine</b>: <b>PySpark</b> is used for ingesting and transforming the raw BMO files.</li>
                <li><b>Data Lake</b>: Processed data is stored as <b>Apache Iceberg</b> tables on AWS S3, enabling scalable, ACID-compliant data storage.</li>
                <li><b>Catalog</b>: <b>AWS Glue</b> Catalog is used to register and manage the <b>Iceberg tables</b>, making them discoverable for querying.</li>
              </Subsection>
              <Subsection title="Query Engine">
                <li><b>Trino</b>: Acts as the distributed SQL query engine, connecting to the <b>Iceberg tables</b> via the Glue Catalog.</li>
                <li><b>Concurrency</b>: <b>Trino</b> supports multiple concurrent queries, allowing many users to access and analyze data simultaneously.</li>
              </Subsection>
              <Subsection title="Backend">
                <li><b>Framework</b>: <b>Django REST Framework</b> (Python).</li>
                <li><b>API</b>: Exposes endpoints for querying, recent searches, and metadata.</li>
                <li><b>Deployment</b>: Hosted on <b>Azure VM</b>... it's free.</li>
                <li><b>Integration</b>: Backend communicates with <b>Trino</b> for live SQL querying and with <b>MongoDB</b> for storing metadata, recent queries, and user submissions.</li>
              </Subsection>
              <Subsection title="Frontend">
                <li><b>Framework</b>: <b>React.js</b> for a fast, interactive user experience.</li>
                <li><b>Styling</b>: <b>Tailwind CSS</b> for modern, responsive, and easily customizable UI components.</li>
                <li><b>Deployment</b>: Hosted on <b>Cloudflare Pages</b> for global performance and security.</li>
                <li><b>Features</b>:
                  <ul className="list-disc pl-5">
                    <li>Search bar for SQL or natural language queries.</li>
                    <li>Sidebar for recent queries and column information.</li>
                    <li>Downloadable CSV results.</li>
                    <li>Responsive design for desktop.</li>
                  </ul>
                </li>
              </Subsection>
            </Section>

            <Divider />

            <Section title="Infrastructure & Cloud">
              <li><b>AWS S3</b>: Stores raw and processed data.</li>
              <li><b>AWS Glue</b>: Manages table metadata and schema.</li>
              <li><b>Azure Cloud</b>: Hosts the Django backend.</li>
              <li><b>Cloudflare</b>: Serves the frontend globally.</li>
              <li><b>MongoDB</b>: Stores user submissions, recent queries, and app metadata.</li>
            </Section>

            <Section title="File & Codebase Structure">
              <li><b>backend_api/</b>: Django backend, API endpoints, config, requirements.</li>
              <li><b>frontend_app/</b>: React frontend, all UI components, Tailwind config, static assets.</li>
              <li><b>pre-processing/</b>: PySpark notebooks and scripts for data cleaning, transformation, and loading into <b>Iceberg tables</b>.</li>
              <li><b>trino_query_engine/</b>: Trino server setup, configs, and scripts for running the distributed SQL engine.</li>
            </Section>

            <Divider />



            <div className="text-center text-[10px] text-blue-200 mt-2">&copy; {new Date().getFullYear()} Nonprofit Explorer</div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="font-semibold text-blue-700 mb-1">{title}</h4>
      <ul className="list-disc pl-5 text-gray-700">{children}</ul>
    </div>
  );
}

function Subsection({ title, children }) {
  return (
    <div className="mb-2">
      <span className="font-semibold">{title}:</span>
      <ul className="list-disc pl-5 text-gray-700">{children}</ul>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-blue-100 my-3"></div>;
}

function PrimaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="min-w-[140px] px-5 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 text-sm font-semibold shadow-md text-center"
    >
      {label}
    </button>
  );
}
