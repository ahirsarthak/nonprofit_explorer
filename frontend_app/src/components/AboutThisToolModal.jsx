import { useState, useEffect } from "react";

export default function AboutThisToolModal() {
  const [open, setOpen] = useState(false);
  // Show for first-time visitors
  useEffect(() => {
    if (!localStorage.getItem("aboutSeen")) {
      setOpen(true);
      localStorage.setItem("aboutSeen", "true");
    }
  }, []);

  return (
    <>
      <button
        className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold shadow"
        onClick={() => setOpen(true)}
      >
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
              ×
            </button>

            <h3 className="font-bold text-xl mb-4 text-blue-800">About This Project</h3>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 w-full gap-2">
              <div className="flex flex-col items-center md:items-start">
                <span className="block text-blue-900 font-semibold">Created by XYZ</span>
                <span className="block text-xs text-blue-700">Software & Data Enthusiast</span>
              </div>
              <div className="flex flex-col items-center md:items-end gap-1 mt-2 md:mt-0">
                <a href="https://www.linkedin.com/in/xyz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900 text-xs">LinkedIn</a>
                <a href="https://github.com/xyz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900 text-xs">GitHub</a>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">Overview & Significance</h4>
              <p className="mb-2 text-gray-700">This project is a modern, full-stack data exploration platform for nonprofit data in the United States. It enables users to query, analyze, and visualize large-scale nonprofit datasets with ease, leveraging best-in-class cloud and open-source technologies.</p>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">What are BMO Files?</h4>
              <ul className="list-disc pl-5 text-gray-700 mb-2">
                <li>BMO files refer to the raw data files containing bulk nonprofit organization information, typically sourced from IRS or other open government datasets.</li>
                <li>These files include details such as Employer Identification Number (EIN), organization name, address, state, city, revenue, group exemption, and IRS subsection codes.</li>
                <li>The project ingests, processes, and makes these BMO files queryable for end users, allowing for powerful search and reporting capabilities.</li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">Project Significance</h4>
              <ul className="list-disc pl-5 text-gray-700 mb-2">
                <li>Democratizes access to nonprofit data for researchers, journalists, analysts, and the public.</li>
                <li>Handles large-scale data efficiently using distributed computing and modern data lakehouse architecture.</li>
                <li>Provides a user-friendly, modern interface for both technical and non-technical users.</li>
                <li>Enables advanced analytics through SQL and natural language queries.</li>
              </ul>
            </div>
            <div className="border-t border-blue-100 my-3"></div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">Technical Architecture</h4>
              <div className="mb-2">
                <span className="font-semibold">Data Processing:</span>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Processing Engine: PySpark is used for ingesting and transforming the raw BMO files.</li>
                  <li>Data Lake: Processed data is stored as Apache Iceberg tables on AWS S3, enabling scalable, ACID-compliant data storage.</li>
                  <li>Catalog: AWS Glue Catalog is used to register and manage the Iceberg tables, making them discoverable for querying.</li>
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Query Engine:</span>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Trino: Acts as the distributed SQL query engine, connecting to the Iceberg tables via the Glue Catalog.</li>
                  <li>Concurrency: Trino supports multiple concurrent queries, allowing many users to access and analyze data simultaneously.</li>
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Backend:</span>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Framework: Django REST Framework (Python).</li>
                  <li>API: Exposes endpoints for querying, recent searches, and metadata.</li>
                  <li>Deployment: Hosted on Oracle Cloud for backend scalability and reliability.</li>
                  <li>Integration: Backend communicates with Trino for live SQL querying and with MongoDB for storing metadata, recent queries, and user submissions.</li>
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Frontend:</span>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Framework: React.js for a fast, interactive user experience.</li>
                  <li>Styling: Tailwind CSS for modern, responsive, and easily customizable UI components.</li>
                  <li>Deployment: Hosted on Cloudflare Pages for global performance and security.</li>
                  <li>Features:
                    <ul className="list-disc pl-5">
                      <li>Modern search bar for SQL or natural language queries.</li>
                      <li>Sidebar for recent queries and column information.</li>
                      <li>Downloadable CSV results.</li>
                      <li>Responsive design for desktop and mobile.</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-blue-100 my-3"></div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">Infrastructure & Cloud</h4>
              <ul className="list-disc pl-5 text-gray-700">
                <li>AWS S3: Stores raw and processed data.</li>
                <li>AWS Glue: Manages table metadata and schema.</li>
                <li>Oracle Cloud: Hosts the Django backend.</li>
                <li>Cloudflare: Serves the frontend globally.</li>
                <li>MongoDB: Stores user submissions, recent queries, and app metadata.</li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">File & Codebase Structure</h4>
              <ul className="list-disc pl-5 text-gray-700">
                <li><b>backend_api/</b>: Django backend, API endpoints, config, requirements.</li>
                <li><b>frontend_app/</b>: React frontend, all UI components, Tailwind config, static assets.</li>
                <li><b>pre-processing/</b>: PySpark notebooks and scripts for data cleaning, transformation, and loading into Iceberg tables.</li>
                <li><b>trino_query_engine/</b>: Trino server setup, configs, and scripts for running the distributed SQL engine.</li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-1">Additional Notes & Features</h4>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Security: Environment variables and secrets are managed via .env files (not committed to source).</li>
                <li>Scalability: The architecture is designed for cloud-native scale, supporting large datasets and many users.</li>
                <li>Extensibility: Easily add new data sources, columns, or analytics features due to modular design.</li>
                <li>Open Source: Built with open technologies for transparency and community contribution.</li>
                <li>Documentation: Each major directory contains a README.md with further details.</li>
              </ul>
            </div>
            <div className="border-t border-blue-100 my-3"></div>
            <div className="mb-2">
              <h4 className="font-semibold text-blue-700 mb-1">Summary</h4>
              <p className="text-gray-700">This project is a state-of-the-art, cloud-native platform for nonprofit data exploration, combining the power of PySpark, Iceberg, Trino, Django, React, and modern cloud services. It makes complex data accessible and actionable for everyone.</p>
            </div>
            <div className="border-t border-blue-100 my-3"></div>
            <div className="mb-2">
              <h4 className="font-semibold text-blue-700 mb-1">Summary</h4>
              <p className="text-gray-700">This project is a state-of-the-art, cloud-native platform for nonprofit data exploration, combining the power of PySpark, Iceberg, Trino, Django, React, and modern cloud services. It makes complex data accessible and actionable for everyone.</p>
            </div>
            <div className="border-t border-blue-100 my-3"></div>
            <div className="flex flex-col items-center justify-center mt-2 mb-2">
              <span className="block text-blue-900 font-semibold">Created by XYZ</span>
              <span className="block text-xs text-blue-700 mb-1">Software & Data Enthusiast</span>
              <a href="https://www.linkedin.com/in/xyz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900 text-xs mt-2">LinkedIn</a>
            </div>
            <div className="text-center text-[10px] text-blue-200 mt-2">&copy; {new Date().getFullYear()} Nonprofit Explorer</div>
          </div>
        </div>
      )}
    </>
  );
}
