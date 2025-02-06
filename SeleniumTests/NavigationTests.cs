using FluentAssertions;
using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests
{
    public class NavigationTests : BaseTest
    {
        [Test]
        public void HobbiesPage_ShouldRender()
        {
            driver.Navigate().GoToUrl(BASE_URL);

            var hobbiesLink = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("nav-hobbies")));
            hobbiesLink.Click();

            var filterSection = wait.Until(ExpectedConditions.ElementIsVisible(By.Id("filter-board-games")));
            filterSection.Displayed.Should().BeTrue("The filter section should be visible on the Hobbies page.");
        }
    }
}
