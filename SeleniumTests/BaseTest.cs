using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Support.UI;

namespace SeleniumTests
{
    public abstract class BaseTest
    {
        protected IWebDriver driver;
        protected WebDriverWait wait;
        protected readonly string BASE_URL = Environment.GetEnvironmentVariable("TEST_BASE_URL") ?? "https://drmdev.github.io/";
        // get browser to use from env var (default to chrome)
        protected string Browser = Environment.GetEnvironmentVariable("TEST_BROWSER")?.ToLower() ?? "chrome";
        protected bool Headless = Environment.GetEnvironmentVariable("TEST_HEADLESS")?.ToLower() == "true";

        //[OneTimeSetUp]
        //public void CleanDriverCache()
        //{
        //    try
        //    {
        //        // Clean up potential cached ChromeDriver files
        //        string[] potentialCachePaths = [
        //            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".cache", "selenium"),
        //            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "selenium-manager"),
        //            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "chromedriver.exe"),
        //            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "chromedriver-win64")
        //        ];

        //        foreach (var path in potentialCachePaths)
        //        {
        //            if (Directory.Exists(path))
        //            {
        //                TestContext.WriteLine($"Cleaning driver cache: {path}");
        //                // Just log, don't actually delete to prevent issues
        //                // Directory.Delete(path, true);
        //            }
        //            else if (File.Exists(path))
        //            {
        //                TestContext.WriteLine($"Found driver file: {path}");
        //                // File.Delete(path);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TestContext.WriteLine($"Warning: Failed to clean driver cache: {ex.Message}");
        //        // Continue execution - this is just a cleanup step
        //    }
        //}

        [SetUp]
        public void SetUp()
        {
            // Initialize WebDriver based on browser and headless params
            driver = InitializeDriver(Browser, Headless);

            // Initialize WebDriverWait
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        protected static IWebDriver InitializeDriver(string browser, bool headless)
        {
            switch (browser)
            {
                case "firefox":
                    var firefoxOptions = new FirefoxOptions();
                    if (headless)
                    {
                        firefoxOptions.AddArgument("--headless");
                    }
                    firefoxOptions.AddArgument("--width=1920");
                    firefoxOptions.AddArgument("--height=1080");
                    return new FirefoxDriver(firefoxOptions);

                case "edge":
                    var edgeOptions = new EdgeOptions();
                    if (headless)
                    {
                        edgeOptions.AddArgument("--headless");
                    }
                    edgeOptions.AddArgument("--disable-gpu");
                    edgeOptions.AddArgument("--window-size=1920,1080");
                    return new EdgeDriver(edgeOptions);

                case "chrome":
                default:
                    var chromeOptions = new ChromeOptions();
                    if (headless)
                    {
                        chromeOptions.AddArgument("--headless");
                    }
                    chromeOptions.AddArgument("--disable-gpu");
                    chromeOptions.AddArgument("--window-size=1920,1080");
                    return new ChromeDriver(chromeOptions);
            }
        }

        [TearDown]
        public void TearDown()
        {
            if (driver != null)
            {
                driver.Close();
                driver.Quit();
                driver.Dispose();
            }
        }

        [OneTimeTearDown]
        public void FinalCleanup()
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();

            var driverProcessNames = new List<string>() { "chromedriver", "geckodriver", "msedgedriver" };
            foreach (var processName in driverProcessNames)
            {
                KillProcessByName(processName);
            }
        }

        // Helper method to kill processes by name
        private static void KillProcessByName(string processName)
        {
            foreach (var process in System.Diagnostics.Process.GetProcessesByName(processName))
            {
                try
                {
                    if (!process.HasExited)
                    {
                        process.Kill();
                        process.WaitForExit(3000); // Wait up to 3 seconds for the process to exit
                    }
                }
                catch (Exception ex)
                {
                    TestContext.WriteLine($"Failed to kill process {processName}: {ex.Message}");
                }
            }
        }
    }
}
