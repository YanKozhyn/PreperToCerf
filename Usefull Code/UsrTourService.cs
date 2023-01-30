 namespace Terrasoft.Configuration.UsrTourService
{
    using System;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
    using Terrasoft.Core;
    using Terrasoft.Core.DB;
    using Terrasoft.Common;
    using Terrasoft.Web.Common;
    using Terrasoft.Core.Entities; 

    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class UsrTourService: BaseService
    {
        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped, ResponseFormat = WebMessageFormat.Json)]
        public decimal GetToursQuantity(string code) {
		
            var tourSectionQuery = new Select(UserConnection)
                .Column("Id")
                .From("UsrBestSection")
                .Where("UsrCode")
                    .IsEqual(Column.Parameter(code))
                as Select;
				
            Guid id = tourSectionQuery.ExecuteScalar<Guid>();
			
            if (id==Guid.Empty) {
                return -1;
            }
			var statusId = "9232DAB6-144A-40F5-AAED-CD8604B4A111";							

            var countQuery = new Select(UserConnection)
                .Column(Func.Sum("UsrTourPrice")).As("Sum")
                .From("UsrTour")
                .Where("UsrUsrBestSectionId").IsEqual(Column.Parameter(id))
                .AddCondition("UsrStatusTourId", LogicalOperation.And).IsEqual(Column.Parameter(statusId)) as Select;

				decimal result = countQuery.ExecuteScalar<decimal>();							
			
            return result;
        }
    }
}