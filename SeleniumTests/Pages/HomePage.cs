using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests.Pages
{
    public class HomePage : BasePage
    {
        public HomePage(IWebDriver driver) : base(driver) { }

        // fluent method for chaining
        public HomePage NavigateToHomePage(string baseUrl)
        {
            Driver.Navigate().GoToUrl(baseUrl);
            return this;
        }

        public HobbiesPage NavigateToHobbies()
        {
            var hobbiesLink = Wait.Until(ExpectedConditions.ElementToBeClickable(NavHobbiesLink));
            hobbiesLink.Click();
            return new HobbiesPage(Driver);
        }
    }
}
