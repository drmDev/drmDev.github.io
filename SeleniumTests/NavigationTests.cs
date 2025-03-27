using FluentAssertions;
using SeleniumTests.Pages;

namespace SeleniumTests
{
    [Category("Navigation")]
    public class NavigationTests : BaseTest
    {
        private HomePage _homePage;

        [SetUp]
        public void Setup()
        {
            base.SetUp();
            _homePage = new HomePage(driver);
        }

        [Test]
        [Retry(2)]
        public void HobbiesPage_ShouldRender()
        {
            var hobbiesPage = _homePage
                .NavigateToHomePage(BASE_URL)
                .NavigateToHobbies();

            hobbiesPage.IsFilterSectionDisplayed()
                .Should().BeTrue("The filter section should be visible on the Hobbies page.");
        }
    }
}
