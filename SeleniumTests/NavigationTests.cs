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
            // Navigate to the landing page
            driver.Navigate().GoToUrl("https://drmdev.github.io/");

            // Click on the "Hobbies" navbar link
            var hobbiesLink = wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//a[contains(text(), 'Hobbies')]")));
            hobbiesLink.Click();

            // Verify specific elements are rendered on the Hobbies page
            var chessIcon = wait.Until(ExpectedConditions.ElementIsVisible(By.XPath("//i[contains(@class, 'fa-chess-king')]")));
            chessIcon.Should().NotBeNull("Chess icons should be present on the Hobbies page.");

            var mtgIcon = wait.Until(ExpectedConditions.ElementIsVisible(By.XPath("//img[@alt='Plains']")));
            mtgIcon.Should().NotBeNull("MTG icons should be present on the Hobbies page.");
        }
    }
}
