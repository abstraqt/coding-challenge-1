using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Backend.Models
{
    public partial class ProductDocument
    {
        public int ProductId { get; set; }
        public HierarchyId DocumentNode { get; set; }
        public DateTime ModifiedDate { get; set; }

        public virtual Document DocumentNodeNavigation { get; set; }
        public virtual Product Product { get; set; }
    }
}
