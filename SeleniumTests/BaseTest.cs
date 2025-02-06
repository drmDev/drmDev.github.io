using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace SeleniumTests
{
    public abstract class BaseTest
    {
        protected IWebDriver driver;
        protected WebDriverWait wait;
        protected readonly string BASE_URL = Environment.GetEnvironmentVariable("TEST_BASE_URL") ?? "https://drmdev.github.io/";

        [SetUp]
        public void SetUp()
        {
            // Configure ChromeOptions for headless mode and other settings
            var options = new ChromeOptions();
            options.AddArgument("--headless");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--window-size=1920,1080");

            // Initialize WebDriver
            driver = new ChromeDriver(options);

            // Maximize the browser window
            driver.Manage().Window.Maximize();

            // Initialize WebDriverWait
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        [TearDown]
        public void TearDown()
        {
            if (driver != null)
            {
                driver.Quit();
                driver.Dispose();
            }
        }
    }
}
