<script>
    const supportEmail = "doc@icimod.org";
    const privacyLink = "https://canteen.icimod.org/privacypolicy/index.html";
    const googleFormUrl = "https://forms.gle/eX9aFsLqJjVMUHM4A";
  </script>
  
  <style>
    .container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 1rem;
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #000000;
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    h2{
      color: #000000;
      font-size:1.4rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .section {
      margin-bottom: 1.5rem;
    }
    .iframe-wrapper {
      /* No flex, just block layout */
    }
    iframe {
      width: 100%;
      min-height: 300px;
      height: auto;
      border: none;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: block;
    }
    @media (max-width: 600px) {
      .container {
        padding: 0.5rem;
        border-radius: 0;
        box-shadow: none;
        max-width: 100vw;
      }
      h1 {
        font-size: 1.3rem;
      }
      h2{
        font-size:1.2rem;
      }
      iframe {
        min-height: 200px;
        height: auto;
      }
    }
  </style>
  
  <div class="container">
    <h2>Support</h2>
  
    <div class="section">
      <p>Thank you for using <strong>iCanteen</strong>. If you have any issues or suggestions, feel free to reach out using the form below or the contact options provided.</p>
    </div>
  
    <div class="section">
      <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
      <p><strong>Privacy Policy:</strong> <a href={privacyLink} target="_blank">{privacyLink}</a></p>
    </div>
  
    <div class="section iframe-wrapper">
      <h2>Submit a Support Request</h2>
      <iframe src={googleFormUrl}></iframe>
    </div>
  
    <div class="section">
      <p>We usually respond within 24–48 hours. Thanks for your patience!</p>
    </div>
  </div>
  