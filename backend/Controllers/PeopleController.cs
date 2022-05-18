using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Contexts;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

#nullable enable

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeopleController : ControllerBase
    {
        private readonly ILogger<PeopleController> _logger;
        private readonly IDbContextFactory<AdventureWorks> _contextFactory;

        public PeopleController(ILogger<PeopleController> logger, IDbContextFactory<AdventureWorks> contextFactory)
        {
            _logger = logger;
            _contextFactory = contextFactory;
        }

        public record SearchRequest(
            string? firstName,
            string? lastName,
            int page = 1,
            int pageSize = 10
        );

        public record SearchPerson(
            int id,
            string firstName,
            string lastName,
            string? emailAddress,
            string? phoneNumber
        );

        public record SearchResult(
            IList<SearchPerson> people,
            int totalCount
        );

        private IQueryable<Person> ApplySearchConditions(IQueryable<Person> query, SearchRequest request)
        {
            if (request.firstName != null)
                query = query.Where(x => x.FirstName.StartsWith(request.firstName));

            if (request.lastName != null)
                query = query.Where(x => x.LastName.StartsWith(request.lastName));

            return query;
        }

        [HttpPost]
        [Route("search")]
        public async Task<ActionResult> Search(SearchRequest request)
        {
            using var context = _contextFactory.CreateDbContext();

            if(request == null)
                return BadRequest("Must provide a request");
            if(request.page < 1)
                return BadRequest("Page must be greater than or equal to 1");
            if(request.pageSize < 1)
                return BadRequest("Page size must be greater than or equal to 1");

            try
            {
                var count = await ApplySearchConditions(context.People, request)
                    .CountAsync();

                var searchedPeople = await ApplySearchConditions(context.People, request)
                    .Include(p => p.EmailAddresses)
                    .Include(p => p.PersonPhones)
                    .OrderBy(p => p.LastName)
                    .ThenBy(p => p.FirstName)
                    .Skip((request.page - 1) * request.pageSize)
                    .Take(request.pageSize)
                    .Select(p => new SearchPerson(
                        p.BusinessEntityId,
                        p.FirstName,
                        p.LastName,
                        p.EmailAddresses.Count > 0 ? p.EmailAddresses.First().EmailAddress1 : null,
                        p.PersonPhones.Count > 0 ? p.PersonPhones.First().PhoneNumber : null
                    ))
                    .ToListAsync();

                return Ok(new SearchResult(searchedPeople, count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching for people");
                return StatusCode(500, "Error searching for people");
            }
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult> Get(int id)
        {
            using var context = _contextFactory.CreateDbContext();

            try
            {
                var person = await context.People
                    .Include(p => p.EmailAddresses)
                    .Include(p => p.PersonPhones).ThenInclude(p => p.PhoneNumberType)
                    .Include(p => p.PersonCreditCards).ThenInclude(c => c.CreditCard)
                    .FirstOrDefaultAsync(p => p.BusinessEntityId == id);

                if (person == null)
                    return NotFound();

                return Ok(new {
                    person.BusinessEntityId,
                    person.PersonType,
                    person.FirstName,
                    person.MiddleName,
                    person.LastName,
                    person.Suffix,
                    person.ModifiedDate,
                    EmailAddresses = person.EmailAddresses.Select(e => e.EmailAddress1),
                    PhoneNumbers = person.PersonPhones.Select(p => new {
                        p.PhoneNumber,
                        p.PhoneNumberTypeId,
                        p.PhoneNumberType.Name
                    }),
                    CreditCards = person.PersonCreditCards.Select(c => new {
                        c.CreditCardId,
                        c.CreditCard.CardType,
                        c.CreditCard.CardNumber,
                        c.CreditCard.ExpMonth,
                        c.CreditCard.ExpYear,
                        c.ModifiedDate
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting person");
                return StatusCode(500, "Error getting person");
            }
        }

        public record UpdatePersonCreditCard(
            int creditCardId,
            string cardType,
            string cardNumber,
            int expMonth,
            int expYear
        );

        public record UpdatePersonPhoneNumber(
            string phoneNumber,
            int phoneNumberTypeId
        );

        public record UpdatePersonRequest(
            string personType,
            string firstName,
            string middleName,
            string lastName,
            string suffix,
            string[] emailAddresses,
            UpdatePersonPhoneNumber[] phoneNumbers,
            UpdatePersonCreditCard[] creditCards
        );

        [HttpPost]
        [Route("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdatePersonRequest request)
        {
            using var context = _contextFactory.CreateDbContext();

            try
            {
                var person = await context.People
                    .Include(p => p.EmailAddresses)
                    .Include(p => p.PersonPhones)
                    .Include(p => p.PersonCreditCards).ThenInclude(c => c.CreditCard)
                    .FirstOrDefaultAsync(p => p.BusinessEntityId == id);

                if (person == null)
                    return NotFound();

                if (request == null)
                    return BadRequest("Must provide a request");

                if (request.firstName != null)
                    person.FirstName = request.firstName;

                if (request.middleName != null)
                    person.MiddleName = request.middleName;

                if (request.lastName != null)
                    person.LastName = request.lastName;

                if (request.suffix != null)
                    person.Suffix = request.suffix;

                if (request.emailAddresses != null)
                {
                    var emailsToRemove = person.EmailAddresses
                        .Where(e => request.emailAddresses.All(x => x != e.EmailAddress1))
                        .ToList();

                    foreach (var email in emailsToRemove)
                        context.EmailAddresses.Remove(email);

                    foreach (var email in request.emailAddresses)
                    {
                        var emailToAdd = person.EmailAddresses
                            .FirstOrDefault(e => e.EmailAddress1 == email);

                        if (emailToAdd == null)
                        {
                            emailToAdd = new EmailAddress {
                                BusinessEntityId = person.BusinessEntityId,
                                EmailAddress1 = email
                            };

                            context.EmailAddresses.Add(emailToAdd);
                        }
                    }
                }

                if (request.phoneNumbers != null)
                {
                    var phonesToRemove = person.PersonPhones
                        .Where(p => request.phoneNumbers.All(x => x.phoneNumber != p.PhoneNumber))
                        .ToList();

                    foreach (var phone in phonesToRemove)
                        context.PersonPhones.Remove(phone);
                    
                    foreach (var phone in request.phoneNumbers)
                    {
                        var phoneToAdd = person.PersonPhones
                            .FirstOrDefault(p => p.PhoneNumber == phone.phoneNumber);

                        if (phoneToAdd == null)
                        {
                            phoneToAdd = new PersonPhone {
                                BusinessEntityId = person.BusinessEntityId,
                                PhoneNumber = phone.phoneNumber,
                                PhoneNumberTypeId = phone.phoneNumberTypeId
                            };

                            context.PersonPhones.Add(phoneToAdd);
                        }
                    }
                }

                if(request.creditCards != null) {
                    var creditCardsToRemove = person.PersonCreditCards
                        .Where(c => request.creditCards.All(x => x.creditCardId != c.CreditCardId))
                        .ToList();

                    foreach (var creditCard in creditCardsToRemove)
                        context.PersonCreditCards.Remove(creditCard);

                    foreach (var creditCard in request.creditCards)
                    {
                        var creditCardToAdd = person.PersonCreditCards
                            .FirstOrDefault(c => c.CreditCardId == creditCard.creditCardId);

                        if (creditCardToAdd == null)
                        {
                            creditCardToAdd = new PersonCreditCard {
                                BusinessEntityId = person.BusinessEntityId,
                                CreditCardId = creditCard.creditCardId,
                                ModifiedDate = DateTime.Now
                            };

                            context.PersonCreditCards.Add(creditCardToAdd);
                        }

                        var existingCreditCard = await context.CreditCards.FirstOrDefaultAsync(cc => cc.CreditCardId == creditCard.creditCardId);
                        if(existingCreditCard == null) {
                            creditCardToAdd.CreditCard = new CreditCard {
                                CreditCardId = creditCard.creditCardId,
                                CardType = creditCard.cardType,
                                CardNumber = creditCard.cardNumber,
                                ExpMonth = (byte)creditCard.expMonth,
                                ExpYear = (short)creditCard.expYear
                            };
                        } else {
                            //Update existingCreditCard
                            existingCreditCard.CardType = creditCard.cardType;
                            existingCreditCard.CardNumber = creditCard.cardNumber;
                            existingCreditCard.ExpMonth = (byte)creditCard.expMonth;
                            existingCreditCard.ExpYear = (short)creditCard.expYear;
                        }
                    }
                }

                await context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating person");
                return StatusCode(500, "Error updating person");
            }
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult> Create([FromBody] UpdatePersonRequest request)
        {
            using var context = _contextFactory.CreateDbContext();

            try
            {
                var person = new Person {
                    PersonType = request.personType,
                    FirstName = request.firstName,
                    MiddleName = request.middleName,
                    LastName = request.lastName,
                    Suffix = request.suffix,
                    ModifiedDate = DateTime.Now
                };

                context.People.Add(person);

                if (request.emailAddresses != null)
                {
                    foreach (var email in request.emailAddresses)
                    {
                        var emailToAdd = new EmailAddress {
                            BusinessEntityId = person.BusinessEntityId,
                            EmailAddress1 = email
                        };

                        context.EmailAddresses.Add(emailToAdd);
                    }
                }

                if (request.phoneNumbers != null)
                {
                    foreach (var phone in request.phoneNumbers)
                    {
                        var phoneToAdd = new PersonPhone {
                            BusinessEntityId = person.BusinessEntityId,
                            PhoneNumber = phone.phoneNumber,
                            PhoneNumberTypeId = phone.phoneNumberTypeId
                        };

                        context.PersonPhones.Add(phoneToAdd);
                    }
                }

                if (request.creditCards != null)
                {
                    foreach (var creditCard in request.creditCards)
                    {
                        var creditCardToAdd = new PersonCreditCard {
                            BusinessEntityId = person.BusinessEntityId,
                            CreditCardId = creditCard.creditCardId,
                            ModifiedDate = DateTime.Now
                        };

                        creditCardToAdd.CreditCard = new CreditCard {
                            CreditCardId = creditCard.creditCardId,
                            CardNumber = creditCard.cardNumber,
                            CardType = creditCard.cardType,
                            ExpMonth = (byte)creditCard.expMonth,
                            ExpYear = (short)creditCard.expYear
                        };

                        context.PersonCreditCards.Add(creditCardToAdd);
                    }
                }

                await context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating person");
                return StatusCode(500, "Error creating person");
            }
        }
    }
}
