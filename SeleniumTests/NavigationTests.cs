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
            driver.Navigate().GoToUrl("https://drmdev.github.io/");

            // Click on the "Hobbies" navbar link
            var hobbiesLink = wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//a[contains(text(), 'Hobbies')]")));
            hobbiesLink.Click();

            var filterSection = wait.Until(ExpectedConditions.ElementIsVisible(By.Id("filter-board-games")));
            filterSection.Displayed.Should().BeTrue("The filter section should be visible on the Hobbies page.");
        }
    }
}
