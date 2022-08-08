const forms = {
    visited: `
    <label class="label">Date from</label>
    <div class="control">
      <input class="input" type="date" name="dateFrom" />
    </div>
    <label class="label">Date to</label>
    <div class="control">
      <input class="input" type="date" name="dateTo" />
    </div>
    <label class="label">Rating</label>
    <div class="control">
      <input class="text" type="number" min="1" max="5" value="3" name="rating" />
    </div>
    <label class="label">Notes</label>
    <div class="control">
      <input class="textarea" type="text" name="notes" />
    </div>
    <label class="label">Add images</label>
    <div class="file">
      <label class="file-label">
        <input class="file-input" type="file" name="imgs" />
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload"></i>
          </span>
        </span>
      </label>
    </div>
    `,
    planned: `
    <label class="label">Notes</label>
    <div class="control">
      <input class="textarea" type="text" name="notes" />
    </div>
    `
}
module.exports = forms;